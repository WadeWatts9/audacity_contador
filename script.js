// Sistema de autenticación y gestión del juego AUDACITY

class AudacityGame {
    constructor() {
        this.users = {
            'alan': { password: '20243', role: 'admin', name: 'Administrador' },
            'contador_gallo': { password: 'galloazul', role: 'counter', name: 'Contador Gallo', counter: 'gallo' },
            'contador_leon': { password: 'reyleon', role: 'counter', name: 'Contador León', counter: 'leon' },
            'contador_perro': { password: 'dalmata', role: 'counter', name: 'Contador Perro', counter: 'perro' },
            'contador_mano': { password: 'guante', role: 'counter', name: 'Contador Mano', counter: 'mano' },
            'contador_estrella': { password: 'brillante', role: 'counter', name: 'Contador Estrella', counter: 'estrella' }
        };
        
        this.balances = {
            bank: 0,
            gallo: 10000,
            leon: 10000,
            perro: 10000,
            mano: 10000,
            estrella: 10000
        };
        
        this.currentUser = null;
        this.operations = []; // Array para almacenar las operaciones
        this.init();
    }

    init() {
        this.loadBalances();
        this.loadOperations();
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => {
            this.handleLogout();
        });

        // Botones de administración
        document.getElementById('resetAllBtn').addEventListener('click', () => {
            this.resetAllBalances();
        });

        document.getElementById('setAmountBtn').addEventListener('click', () => {
            this.showAmountModal();
        });

        document.getElementById('swapBalancesBtn').addEventListener('click', () => {
            this.showSwapModal();
        });

        // Botones del panel de banco del admin
        document.getElementById('adminSetBankBalanceBtn').addEventListener('click', () => {
            this.showSetBankBalanceModal();
        });

        document.getElementById('adminRedistributeEquallyBtn').addEventListener('click', () => {
            this.redistributeEqually();
        });

        document.getElementById('adminRedistributeCustomBtn').addEventListener('click', () => {
            this.showCustomRedistributionModal();
        });

        document.getElementById('adminTransferToCounterBtn').addEventListener('click', () => {
            this.showTransferFromBankModal();
        });

        // Botones de modales
        document.getElementById('applyAmountsBtn').addEventListener('click', () => {
            this.applyAmounts();
        });

        document.getElementById('applySwapBtn').addEventListener('click', () => {
            this.applySwap();
        });

        document.getElementById('applyBankBalanceBtn').addEventListener('click', () => {
            this.applyBankBalance();
        });

        // Botones del header del banco
        document.getElementById('bank-info').addEventListener('click', () => {
            if (this.currentUser && this.currentUser.role === 'admin') {
                this.showBankOperationsModal();
            }
        });

        document.getElementById('headerSetBankBalanceBtn').addEventListener('click', () => {
            this.showSetBankBalanceModal();
            this.closeModal('bankOperationsModal');
        });

        document.getElementById('headerRedistributeEquallyBtn').addEventListener('click', () => {
            this.redistributeEqually();
            this.closeModal('bankOperationsModal');
        });

        document.getElementById('headerRedistributeCustomBtn').addEventListener('click', () => {
            this.showCustomRedistributionModal();
            this.closeModal('bankOperationsModal');
        });

        document.getElementById('headerTransferToCounterBtn').addEventListener('click', () => {
            this.showTransferFromBankModal();
            this.closeModal('bankOperationsModal');
        });

        // Botón del dashboard
        document.getElementById('dashboardBtn').addEventListener('click', () => {
            this.showDashboard();
        });

        // Botón para volver al juego
        document.getElementById('backToGameBtn').addEventListener('click', () => {
            this.showGameScreen();
        });

        // Cerrar modales
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                this.closeModal(e.target.closest('.modal').id);
            });
        });

        // Cerrar modal al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        if (this.users[username] && this.users[username].password === password) {
            this.currentUser = this.users[username];
            this.logOperation(`Usuario ${this.currentUser.name} inició sesión`);
            this.showGameScreen();
            this.showNotification(`Bienvenido, ${this.currentUser.name}`, 'success');
        } else {
            errorDiv.textContent = 'Usuario o contraseña incorrectos';
            errorDiv.style.display = 'block';
        }
    }

    handleLogout() {
        this.currentUser = null;
        this.showLoginScreen();
        this.showNotification('Sesión cerrada correctamente', 'success');
    }

    showLoginScreen() {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('loginError').style.display = 'none';
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }

    showGameScreen() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'none';
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('currentUser').textContent = this.currentUser.name;
        document.getElementById('currentUserRole').textContent = this.currentUser.role === 'admin' ? 'Administrador' : 'Contador';
        this.updateHeaderBankBalance();
        this.setupUserInterface();
    }

    showDashboard() {
        document.getElementById('gameScreen').style.display = 'none';
        document.getElementById('dashboardScreen').style.display = 'block';
        this.updateDashboard();
    }

    setupUserInterface() {
        // Mostrar/ocultar panel de administración
        const adminPanel = document.getElementById('adminPanel');
        const bankInfo = document.getElementById('bank-info');
        
        if (this.currentUser.role === 'admin') {
            adminPanel.style.display = 'block';
            bankInfo.classList.add('admin-clickable');
        } else {
            adminPanel.style.display = 'none';
            bankInfo.classList.remove('admin-clickable');
        }

        // Configurar acciones para cada contador
        this.setupCounterActions();
    }

    setupCounterActions() {
        const counters = ['gallo', 'leon', 'perro', 'mano', 'estrella'];
        
        counters.forEach(counter => {
            const actionsDiv = document.getElementById(`actions-${counter}`);
            actionsDiv.innerHTML = '';

            if (this.currentUser.role === 'admin' || this.currentUser.counter === counter) {
                // Botones para contadores normales
                this.createActionButton(actionsDiv, '💰 Sumar Monto', 'custom_add', counter);
                this.createActionButton(actionsDiv, '💸 Restar Monto', 'custom_subtract', counter);
                this.createActionButton(actionsDiv, '🔄 Transferir %', 'custom_transfer', counter);
                this.createActionButton(actionsDiv, '📈 Sumar % de Otro', 'custom_add_percentage', counter);
                this.createActionButton(actionsDiv, '📉 Restar % de Otro', 'custom_subtract_percentage', counter);
                this.createActionButton(actionsDiv, '🏦 Depositar % en Banco', 'deposit_to_bank', counter);
                this.createActionButton(actionsDiv, '⚡ Duplicar Saldo', 'duplicate', counter);
                this.createActionButton(actionsDiv, '⚠️ Perder Mitad', 'lose_half', counter);
                
                // Botones adicionales solo para admin
                if (this.currentUser.role === 'admin') {
                    this.createActionButton(actionsDiv, '🎯 Establecer Saldo', 'set_balance', counter);
                }
            } else {
                // Solo mostrar el saldo para otros contadores
                actionsDiv.innerHTML = '<p style="color: #666; text-align: center;">Solo lectura</p>';
            }
        });
    }

    createActionButton(container, text, action, counter) {
        const button = document.createElement('button');
        button.className = `action-btn btn-${action}`;
        button.textContent = text;
        button.addEventListener('click', () => {
            this.handleAction(action, counter);
        });
        container.appendChild(button);
    }

    handleAction(action, counter) {
        switch (action) {
            case 'custom_add':
                this.showAmountModal('Sumar Monto', counter, 'add');
                break;
            case 'custom_subtract':
                this.showAmountModal('Restar Monto', counter, 'subtract');
                break;
            case 'custom_transfer':
                this.showTransferModal(counter);
                break;
            case 'custom_add_percentage':
                this.showAddPercentageModal(counter);
                break;
            case 'custom_subtract_percentage':
                this.showSubtractPercentageModal(counter);
                break;
            case 'deposit_to_bank':
                this.showDepositToBankModal(counter);
                break;
            case 'duplicate':
                this.duplicateBalance(counter);
                break;
            case 'lose_half':
                this.loseHalfBalance(counter);
                break;
            case 'set_balance':
                this.showSetBalanceModal(counter);
                break;
        }
    }

    showAmountModal(title, counter, operation) {
        this.showModal('operationModal', title, `
            <div class="input-group">
                <label>Monto a ${operation === 'add' ? 'sumar' : 'restar'}:</label>
                <input type="number" id="customAmount" placeholder="Ingresa el monto" min="1">
            </div>
            <button id="confirmAmountBtn" class="admin-btn">Confirmar</button>
        `);

        document.getElementById('confirmAmountBtn').addEventListener('click', () => {
            const amount = parseInt(document.getElementById('customAmount').value);
            if (amount && amount > 0) {
                if (operation === 'add') {
                    this.balances[counter] += amount;
                    this.logOperation(`${this.currentUser.name} sumó $TDL ${amount.toLocaleString()} al contador ${this.getCounterName(counter)}`);
                    this.showNotification(`Se sumaron $TDL ${amount.toLocaleString()} al contador ${this.getCounterName(counter)}`, 'success');
                } else {
                    if (this.balances[counter] >= amount) {
                        this.balances[counter] -= amount;
                        this.logOperation(`${this.currentUser.name} restó $TDL ${amount.toLocaleString()} del contador ${this.getCounterName(counter)}`);
                        this.showNotification(`Se restaron $TDL ${amount.toLocaleString()} del contador ${this.getCounterName(counter)}`, 'success');
                    } else {
                        this.showNotification('Saldo insuficiente', 'error');
                        return;
                    }
                }
                this.updateBalances();
                this.saveBalances();
                this.closeModal('operationModal');
            } else {
                this.showNotification('Ingresa un monto válido', 'error');
            }
        });
    }

    showTransferModal(fromCounter) {
        this.showModal('operationModal', 'Transferir Porcentaje', `
            <div class="input-group">
                <label>Porcentaje a transferir:</label>
                <input type="number" id="transferPercentage" placeholder="Ej: 25" min="1" max="100">
            </div>
            <div class="input-group">
                <label>Hacia qué contador:</label>
                <select id="transferTo">
                    <option value="">Seleccionar contador</option>
                    ${this.getOtherCounters(fromCounter).map(counter => 
                        `<option value="${counter}">${this.getCounterName(counter)}</option>`
                    ).join('')}
                </select>
            </div>
            <button id="confirmTransferBtn" class="admin-btn">Confirmar Transferencia</button>
        `);

        document.getElementById('confirmTransferBtn').addEventListener('click', () => {
            const percentage = parseInt(document.getElementById('transferPercentage').value);
            const toCounter = document.getElementById('transferTo').value;
            
            if (percentage && percentage > 0 && percentage <= 100 && toCounter) {
                const fromAmount = this.balances[fromCounter];
                const transferAmount = Math.floor(fromAmount * (percentage / 100));
                
                if (this.balances[fromCounter] >= transferAmount) {
                    this.balances[fromCounter] -= transferAmount;
                    this.balances[toCounter] += transferAmount;
                    this.logOperation(`${this.currentUser.name} transfirió $TDL ${transferAmount.toLocaleString()} de ${this.getCounterName(fromCounter)} a ${this.getCounterName(toCounter)}`);
                    this.showNotification(
                        `Transferidos $TDL ${transferAmount.toLocaleString()} de ${this.getCounterName(fromCounter)} a ${this.getCounterName(toCounter)}`, 
                        'success'
                    );
                    this.updateBalances();
                    this.saveBalances();
                    this.closeModal('operationModal');
                } else {
                    this.showNotification('Saldo insuficiente para la transferencia', 'error');
                }
            } else {
                this.showNotification('Completa todos los campos correctamente', 'error');
            }
        });
    }

    showAddPercentageModal(toCounter) {
        this.showModal('operationModal', 'Sumar Porcentaje de Otro', `
            <div class="input-group">
                <label>De qué contador:</label>
                <select id="addFromCounter">
                    <option value="">Seleccionar contador</option>
                    ${this.getOtherCounters(toCounter).map(counter => 
                        `<option value="${counter}">${this.getCounterName(counter)}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="input-group">
                <label>Porcentaje a sumar:</label>
                <input type="number" id="addPercentage" placeholder="Ej: 25" min="1" max="100">
            </div>
            <button id="confirmAddPercentageBtn" class="admin-btn">Confirmar</button>
        `);

        document.getElementById('confirmAddPercentageBtn').addEventListener('click', () => {
            const fromCounter = document.getElementById('addFromCounter').value;
            const percentage = parseInt(document.getElementById('addPercentage').value);
            
            if (fromCounter && percentage && percentage > 0 && percentage <= 100) {
                const addAmount = Math.floor(this.balances[fromCounter] * (percentage / 100));
                this.balances[toCounter] += addAmount;
                this.logOperation(`${this.currentUser.name} sumó sin pérdida $TDL ${addAmount.toLocaleString()} (${percentage}% de ${this.getCounterName(fromCounter)}) a ${this.getCounterName(toCounter)}`);
                this.showNotification(
                    `Se sumaron $TDL ${addAmount.toLocaleString()} (${percentage}% de ${this.getCounterName(fromCounter)}) a ${this.getCounterName(toCounter)}`, 
                    'success'
                );
                this.updateBalances();
                this.saveBalances();
                this.closeModal('operationModal');
            } else {
                this.showNotification('Completa todos los campos correctamente', 'error');
            }
        });
    }

    showSubtractPercentageModal(toCounter) {
        this.showModal('operationModal', 'Restar Porcentaje de Otro', `
            <div class="input-group">
                <label>De qué contador:</label>
                <select id="subtractFromCounter">
                    <option value="">Seleccionar contador</option>
                    ${this.getOtherCounters(toCounter).map(counter => 
                        `<option value="${counter}">${this.getCounterName(counter)}</option>`
                    ).join('')}
                </select>
            </div>
            <div class="input-group">
                <label>Porcentaje a restar:</label>
                <input type="number" id="subtractPercentage" placeholder="Ej: 25" min="1" max="100">
            </div>
            <button id="confirmSubtractPercentageBtn" class="admin-btn">Confirmar</button>
        `);

        document.getElementById('confirmSubtractPercentageBtn').addEventListener('click', () => {
            const fromCounter = document.getElementById('subtractFromCounter').value;
            const percentage = parseInt(document.getElementById('subtractPercentage').value);
            
            if (fromCounter && percentage && percentage > 0 && percentage <= 100) {
                const subtractAmount = Math.floor(this.balances[fromCounter] * (percentage / 100));
                
                if (this.balances[toCounter] >= subtractAmount) {
                    this.balances[toCounter] -= subtractAmount;
                    this.logOperation(`${this.currentUser.name} restó sin pérdida $TDL ${subtractAmount.toLocaleString()} (${percentage}% de ${this.getCounterName(fromCounter)}) de ${this.getCounterName(toCounter)}`);
                    this.showNotification(
                        `Se restaron $TDL ${subtractAmount.toLocaleString()} (${percentage}% de ${this.getCounterName(fromCounter)}) de ${this.getCounterName(toCounter)}`, 
                        'success'
                    );
                    this.updateBalances();
                    this.saveBalances();
                    this.closeModal('operationModal');
                } else {
                    this.showNotification('Saldo insuficiente para realizar la operación', 'error');
                }
            } else {
                this.showNotification('Completa todos los campos correctamente', 'error');
            }
        });
    }

    showDepositToBankModal(fromCounter) {
        this.showModal('operationModal', 'Depositar en Banco Central', `
            <div class="input-group">
                <label>Porcentaje a depositar:</label>
                <input type="number" id="depositPercentage" placeholder="Ej: 25" min="1" max="100">
            </div>
            <button id="confirmDepositBtn" class="admin-btn">Confirmar Depósito</button>
        `);

        document.getElementById('confirmDepositBtn').addEventListener('click', () => {
            const percentage = parseInt(document.getElementById('depositPercentage').value);
            
            if (percentage && percentage > 0 && percentage <= 100) {
                const depositAmount = Math.floor(this.balances[fromCounter] * (percentage / 100));
                this.balances[fromCounter] -= depositAmount;
                this.balances.bank += depositAmount;
                this.logOperation(`${this.currentUser.name} depositó $TDL ${depositAmount.toLocaleString()} (${percentage}% de ${this.getCounterName(fromCounter)}) en el banco`);
                this.showNotification(
                    `Se depositaron $TDL ${depositAmount.toLocaleString()} (${percentage}% de ${this.getCounterName(fromCounter)}) en el banco`, 
                    'success'
                );
                this.updateBalances();
                this.saveBalances();
                this.closeModal('operationModal');
            } else {
                this.showNotification('Ingresa un porcentaje válido (1-100)', 'error');
            }
        });
    }

    showSetBalanceModal(counter) {
        this.showModal('operationModal', `Establecer Saldo - ${this.getCounterName(counter)}`, `
            <div class="input-group">
                <label>Nuevo saldo para ${this.getCounterName(counter)}:</label>
                <input type="number" id="newBalance" placeholder="Ej: 25000" min="0" value="${this.balances[counter]}">
            </div>
            <button id="confirmSetBalanceBtn" class="admin-btn">Establecer Saldo</button>
        `);

        document.getElementById('confirmSetBalanceBtn').addEventListener('click', () => {
            const newBalance = parseInt(document.getElementById('newBalance').value);
            if (newBalance >= 0) {
                this.balances[counter] = newBalance;
                this.logOperation(`${this.currentUser.name} estableció el saldo de ${this.getCounterName(counter)} en $TDL ${newBalance.toLocaleString()}`);
                this.showNotification(`Saldo de ${this.getCounterName(counter)} establecido en $TDL ${newBalance.toLocaleString()}`, 'success');
                this.updateBalances();
                this.saveBalances();
                this.closeModal('operationModal');
            } else {
                this.showNotification('Ingresa un saldo válido (mayor o igual a 0)', 'error');
            }
        });
    }

    duplicateBalance(counter) {
        this.balances[counter] *= 2;
        this.logOperation(`${this.currentUser.name} duplicó el saldo de ${this.getCounterName(counter)}`);
        this.showNotification(`Saldo duplicado para ${this.getCounterName(counter)}`, 'success');
        this.updateBalances();
        this.saveBalances();
    }

    loseHalfBalance(counter) {
        this.balances[counter] = Math.floor(this.balances[counter] / 2);
        this.logOperation(`${this.currentUser.name} redujo a la mitad el saldo de ${this.getCounterName(counter)}`);
        this.showNotification(`Saldo reducido a la mitad para ${this.getCounterName(counter)}`, 'warning');
        this.updateBalances();
        this.saveBalances();
    }

    showSetBankBalanceModal() {
        // Llenar el valor actual del banco
        document.getElementById('newBankBalance').value = this.balances.bank;
        document.getElementById('setBankBalanceModal').style.display = 'block';
    }

    applyBankBalance() {
        const newBalance = parseInt(document.getElementById('newBankBalance').value);
        if (newBalance >= 0) {
            this.balances.bank = newBalance;
            this.logOperation(`${this.currentUser.name} estableció el saldo del banco en $TDL ${newBalance.toLocaleString()}`);
            this.updateBalances();
            this.saveBalances();
            this.showNotification(`Saldo del banco establecido en $TDL ${newBalance.toLocaleString()}`, 'success');
            this.closeModal('setBankBalanceModal');
        } else {
            this.showNotification('Ingresa un saldo válido (mayor o igual a 0)', 'error');
        }
    }

    showBankOperationsModal() {
        this.showModal('bankOperationsModal', 'Operaciones del Banco Central', `
            <div class="bank-operations">
                <div class="bank-balance-info">
                    <label>Saldo actual:</label>
                    <div class="bank-balance-display">$TDL ${this.balances.bank.toLocaleString()}</div>
                </div>
                <div class="bank-operation-buttons">
                    <button id="headerSetBankBalanceBtn" class="admin-btn">🎯 Establecer Saldo del Banco</button>
                    <button id="headerRedistributeEquallyBtn" class="admin-btn">🏦 Redistribuir Equitativamente</button>
                    <button id="headerRedistributeCustomBtn" class="admin-btn">🎯 Redistribución Personalizada</button>
                    <button id="headerTransferToCounterBtn" class="admin-btn">💰 Transferir a Contador</button>
                </div>
            </div>
        `);
    }

    showCustomRedistributionModal() {
        this.showModal('operationModal', 'Redistribución Personalizada del Banco', `
            <div class="input-group">
                <label>Gallo:</label>
                <input type="number" id="redist-gallo" placeholder="0" min="0">
            </div>
            <div class="input-group">
                <label>León:</label>
                <input type="number" id="redist-leon" placeholder="0" min="0">
            </div>
            <div class="input-group">
                <label>Perro:</label>
                <input type="number" id="redist-perro" placeholder="0" min="0">
            </div>
            <div class="input-group">
                <label>Mano:</label>
                <input type="number" id="redist-mano" placeholder="0" min="0">
            </div>
            <div class="input-group">
                <label>Estrella:</label>
                <input type="number" id="redist-estrella" placeholder="0" min="0">
            </div>
            <button id="confirmCustomRedistributionBtn" class="admin-btn">Aplicar Redistribución</button>
        `);

        document.getElementById('confirmCustomRedistributionBtn').addEventListener('click', () => {
            const redistributions = {
                gallo: parseInt(document.getElementById('redist-gallo').value) || 0,
                leon: parseInt(document.getElementById('redist-leon').value) || 0,
                perro: parseInt(document.getElementById('redist-perro').value) || 0,
                mano: parseInt(document.getElementById('redist-mano').value) || 0,
                estrella: parseInt(document.getElementById('redist-estrella').value) || 0
            };

            const totalRedistributed = Object.values(redistributions).reduce((sum, val) => sum + val, 0);

            if (totalRedistributed > this.balances.bank) {
                this.showNotification('La suma de redistribuciones excede el saldo del banco', 'error');
                return;
            }

            if (totalRedistributed === 0) {
                this.showNotification('No se especificó ninguna redistribución', 'warning');
                return;
            }

            const counters = ['gallo', 'leon', 'perro', 'mano', 'estrella'];
            counters.forEach(counter => {
                this.balances[counter] += redistributions[counter];
            });

            this.balances.bank -= totalRedistributed;
            this.logOperation(`${this.currentUser.name} redistribuyó personalizadamente $TDL ${totalRedistributed.toLocaleString()} del banco`);
            this.showNotification(`Se redistribuyeron $TDL ${totalRedistributed.toLocaleString()} del banco según la configuración personalizada`, 'success');
            this.updateBalances();
            this.saveBalances();
            this.closeModal('operationModal');
        });
    }

    showTransferFromBankModal() {
        this.showModal('operationModal', 'Transferir del Banco a Contador', `
            <div class="input-group">
                <label>Hacia qué contador:</label>
                <select id="transferToFromBank">
                    <option value="">Seleccionar contador</option>
                    <option value="gallo">Gallo</option>
                    <option value="leon">León</option>
                    <option value="perro">Perro</option>
                    <option value="mano">Mano</option>
                    <option value="estrella">Estrella</option>
                </select>
            </div>
            <div class="input-group">
                <label>Monto a transferir:</label>
                <input type="number" id="transferAmountFromBank" placeholder="Ej: 5000" min="1" max="${this.balances.bank}">
            </div>
            <button id="confirmTransferFromBankBtn" class="admin-btn">Confirmar Transferencia</button>
        `);

        document.getElementById('confirmTransferFromBankBtn').addEventListener('click', () => {
            const toCounter = document.getElementById('transferToFromBank').value;
            const amount = parseInt(document.getElementById('transferAmountFromBank').value);
            
            if (toCounter && amount && amount > 0 && amount <= this.balances.bank) {
                this.balances.bank -= amount;
                this.balances[toCounter] += amount;
                this.logOperation(`${this.currentUser.name} transfirió $TDL ${amount.toLocaleString()} del banco a ${this.getCounterName(toCounter)}`);
                this.showNotification(
                    `Se transfirieron $TDL ${amount.toLocaleString()} del banco a ${this.getCounterName(toCounter)}`, 
                    'success'
                );
                this.updateBalances();
                this.saveBalances();
                this.closeModal('operationModal');
            } else {
                this.showNotification('Completa todos los campos correctamente', 'error');
            }
        });
    }

    redistributeEqually() {
        if (this.balances.bank <= 0) {
            this.showNotification('No hay saldo en el banco para redistribuir', 'warning');
            return;
        }

        const counters = ['gallo', 'leon', 'perro', 'mano', 'estrella'];
        const amountPerCounter = Math.floor(this.balances.bank / counters.length);

        counters.forEach(counter => {
            this.balances[counter] += amountPerCounter;
        });

        this.balances.bank = 0;
        this.logOperation(`${this.currentUser.name} redistribuyó equitativamente $TDL ${amountPerCounter.toLocaleString()} a cada contador desde el banco`);
        this.showNotification(`Se redistribuyó equitativamente el saldo del banco entre todos los contadores`, 'success');
        this.updateBalances();
        this.saveBalances();
    }

    resetAllBalances() {
        // Preguntar si es un nuevo juego
        const isNewGame = confirm('¿Es un nuevo juego? Si seleccionas "Aceptar", se reiniciará todo incluyendo el banco. Si seleccionas "Cancelar", solo se reiniciarán los contadores manteniendo el saldo del banco.');
        
        if (isNewGame) {
            // Nuevo juego: reiniciar todo incluyendo el banco
            this.balances = {
                bank: 0,
                gallo: 10000,
                leon: 10000,
                perro: 10000,
                mano: 10000,
                estrella: 10000
            };
            this.logOperation(`${this.currentUser.name} inició un nuevo juego - Todos los saldos reiniciados a $TDL 10,000`);
            this.showNotification('Nuevo juego iniciado. Todos los saldos han sido reiniciados a $TDL 10,000', 'success');
        } else {
            // Mantener el saldo del banco
            const currentBankBalance = this.balances.bank;
            this.balances = {
                bank: currentBankBalance,
                gallo: 10000,
                leon: 10000,
                perro: 10000,
                mano: 10000,
                estrella: 10000
            };
            this.logOperation(`${this.currentUser.name} reinició contadores a $TDL 10,000 - Banco mantenido en $TDL ${currentBankBalance.toLocaleString()}`);
            this.showNotification(`Contadores reiniciados a $TDL 10,000. Saldo del banco mantenido: $TDL ${currentBankBalance.toLocaleString()}`, 'success');
        }
        
        this.updateBalances();
        this.saveBalances();
    }

    showAmountModal() {
        // Llenar los valores actuales
        document.getElementById('amount-bank').value = this.balances.bank;
        document.getElementById('amount-gallo').value = this.balances.gallo;
        document.getElementById('amount-leon').value = this.balances.leon;
        document.getElementById('amount-perro').value = this.balances.perro;
        document.getElementById('amount-mano').value = this.balances.mano;
        document.getElementById('amount-estrella').value = this.balances.estrella;
        
        document.getElementById('amountModal').style.display = 'block';
    }

    applyAmounts() {
        const newBalances = {
            bank: parseInt(document.getElementById('amount-bank').value) || 0,
            gallo: parseInt(document.getElementById('amount-gallo').value) || 0,
            leon: parseInt(document.getElementById('amount-leon').value) || 0,
            perro: parseInt(document.getElementById('amount-perro').value) || 0,
            mano: parseInt(document.getElementById('amount-mano').value) || 0,
            estrella: parseInt(document.getElementById('amount-estrella').value) || 0
        };

        // Verificar si hay cambios
        const hasChanges = Object.keys(newBalances).some(key => this.balances[key] !== newBalances[key]);

        if (hasChanges) {
            this.balances = { ...newBalances };
            this.updateBalances();
            this.saveBalances();
            this.showNotification('Montos actualizados correctamente', 'success');
            document.getElementById('amountModal').style.display = 'none';
        } else {
            this.showNotification('No hay cambios para aplicar', 'warning');
        }
    }

    showSwapModal() {
        document.getElementById('swapModal').style.display = 'block';
    }

    applySwap() {
        const fromCounter = document.getElementById('swapFrom').value;
        const toCounter = document.getElementById('swapTo').value;

        if (fromCounter === toCounter) {
            this.showNotification('No puedes intercambiar un contador consigo mismo', 'error');
            return;
        }

        const tempBalance = this.balances[fromCounter];
        this.balances[fromCounter] = this.balances[toCounter];
        this.balances[toCounter] = tempBalance;

        this.updateBalances();
        this.saveBalances();
        this.showNotification(
            `Saldos intercambiados entre ${this.getCounterName(fromCounter)} y ${this.getCounterName(toCounter)}`, 
            'success'
        );
        document.getElementById('swapModal').style.display = 'none';
    }

    showModal(modalId, title, content) {
        document.getElementById('modalTitle').textContent = title;
        document.getElementById('modalBody').innerHTML = content;
        document.getElementById(modalId).style.display = 'block';
    }

    closeModal(modalId) {
        document.getElementById(modalId).style.display = 'none';
    }

    getOtherCounters(excludeCounter) {
        return ['gallo', 'leon', 'perro', 'mano', 'estrella'].filter(c => c !== excludeCounter);
    }

    getCounterName(counter) {
        const names = {
            bank: 'Banco Central',
            gallo: 'Gallo',
            leon: 'León',
            perro: 'Perro',
            mano: 'Mano',
            estrella: 'Estrella'
        };
        return names[counter] || counter;
    }

    updateBalances() {
        // Actualizar saldos de contadores
        const counters = ['gallo', 'leon', 'perro', 'mano', 'estrella'];
        counters.forEach(counter => {
            document.getElementById(`balance-${counter}`).textContent = `$TDL ${this.balances[counter].toLocaleString()}`;
        });

        // Actualizar saldo del banco en el header
        this.updateHeaderBankBalance();
    }

    updateHeaderBankBalance() {
        document.getElementById('header-bank-balance').textContent = `$TDL ${this.balances.bank.toLocaleString()}`;
    }

    saveBalances() {
        localStorage.setItem('audacity_balances', JSON.stringify(this.balances));
    }

    loadBalances() {
        const saved = localStorage.getItem('audacity_balances');
        if (saved) {
            this.balances = { ...this.balances, ...JSON.parse(saved) };
        }
        this.updateBalances();
    }

    showNotification(message, type = 'success') {
        // Remover notificación existente
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    // Función para registrar operaciones
    logOperation(description, user = null) {
        const operation = {
            timestamp: new Date(),
            description: description,
            user: user || (this.currentUser ? this.currentUser.name : 'Sistema')
        };
        
        this.operations.unshift(operation); // Agregar al inicio
        if (this.operations.length > 50) { // Mantener solo las últimas 50
            this.operations = this.operations.slice(0, 50);
        }
        
        this.saveOperations();
    }

    // Función para actualizar el dashboard
    updateDashboard() {
        this.updateDashboardBalances();
        this.updateDashboardOperations();
    }

    updateDashboardBalances() {
        const balancesContainer = document.getElementById('dashboardBalances');
        const counters = [
            { key: 'bank', name: 'Banco Central', icon: '🏦' },
            { key: 'gallo', name: 'Gallo', icon: '🐦' },
            { key: 'leon', name: 'León', icon: '👑' },
            { key: 'perro', name: 'Perro', icon: '🐕' },
            { key: 'mano', name: 'Mano', icon: '✋' },
            { key: 'estrella', name: 'Estrella', icon: '⭐' }
        ];

        balancesContainer.innerHTML = counters.map(counter => `
            <div class="balance-card">
                <h3>${counter.icon} ${counter.name}</h3>
                <div class="amount">$TDL ${this.balances[counter.key].toLocaleString()}</div>
            </div>
        `).join('');
    }

    updateDashboardOperations() {
        const operationsContainer = document.getElementById('operationsList');
        const lastOperations = this.operations.slice(0, 10); // Últimas 10 operaciones

        if (lastOperations.length === 0) {
            operationsContainer.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.7);">No hay operaciones registradas</p>';
            return;
        }

        operationsContainer.innerHTML = lastOperations.map(operation => `
            <div class="operation-item">
                <div class="operation-time">${operation.timestamp.toLocaleString()}</div>
                <div class="operation-description">${operation.description}</div>
                <div class="operation-user">👤 ${operation.user}</div>
            </div>
        `).join('');
    }

    // Función para guardar operaciones
    saveOperations() {
        localStorage.setItem('audacity_operations', JSON.stringify(this.operations));
    }

    // Función para cargar operaciones
    loadOperations() {
        const saved = localStorage.getItem('audacity_operations');
        if (saved) {
            this.operations = JSON.parse(saved).map(op => ({
                ...op,
                timestamp: new Date(op.timestamp)
            }));
        }
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AudacityGame();
});
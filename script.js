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
            gallo: 10000,
            leon: 10000,
            perro: 10000,
            mano: 10000,
            estrella: 10000
        };
        
        this.currentUser = null;
        this.connectedUsers = new Set();
        
        this.initializeEventListeners();
        this.loadBalances();
    }

    initializeEventListeners() {
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

        // Aplicar montos
        document.getElementById('applyAmountsBtn').addEventListener('click', () => {
            this.applyAmounts();
        });

        // Aplicar intercambio
        document.getElementById('applySwapBtn').addEventListener('click', () => {
            this.applySwap();
        });

        // Cerrar modales
        document.querySelectorAll('.close').forEach(closeBtn => {
            closeBtn.addEventListener('click', (e) => {
                e.target.closest('.modal').style.display = 'none';
            });
        });

        // Cerrar modales al hacer clic fuera
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
    }

    handleLogin() {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const errorDiv = document.getElementById('loginError');

        if (this.users[username] && this.users[username].password === password) {
            this.currentUser = {
                username,
                ...this.users[username]
            };
            
            this.connectedUsers.add(username);
            this.showGameScreen();
            this.setupUserInterface();
            this.showNotification(`Bienvenido, ${this.currentUser.name}`, 'success');
        } else {
            errorDiv.textContent = 'Usuario o contraseña incorrectos';
            errorDiv.style.display = 'block';
        }
    }

    handleLogout() {
        this.connectedUsers.delete(this.currentUser.username);
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
        document.getElementById('gameScreen').style.display = 'block';
        document.getElementById('currentUser').textContent = this.currentUser.name;
    }

    setupUserInterface() {
        // Mostrar/ocultar panel de administración
        const adminPanel = document.getElementById('adminPanel');
        if (this.currentUser.role === 'admin') {
            adminPanel.style.display = 'block';
        } else {
            adminPanel.style.display = 'none';
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
                // Botones para el contador específico
                this.createActionButton(actionsDiv, 'Sumar $1000', 'add', counter, 1000);
                this.createActionButton(actionsDiv, 'Restar $1000', 'subtract', counter, 1000);
                this.createActionButton(actionsDiv, 'Sumar $5000', 'add', counter, 5000);
                this.createActionButton(actionsDiv, 'Restar $5000', 'subtract', counter, 5000);
                this.createActionButton(actionsDiv, 'Transferir 25%', 'percentage', counter, 25);
                this.createActionButton(actionsDiv, 'Transferir 50%', 'percentage', counter, 50);
            } else {
                // Solo mostrar el saldo para otros contadores
                actionsDiv.innerHTML = '<p style="color: #666; text-align: center;">Solo lectura</p>';
            }
        });
    }

    createActionButton(container, text, action, counter, value) {
        const button = document.createElement('button');
        button.className = `action-btn btn-${action}`;
        button.textContent = text;
        button.addEventListener('click', () => {
            this.handleAction(action, counter, value);
        });
        container.appendChild(button);
    }

    handleAction(action, counter, value) {
        if (action === 'add') {
            this.balances[counter] += value;
            this.showNotification(`Se sumaron $TDL ${value.toLocaleString()} al contador ${this.getCounterName(counter)}`, 'success');
        } else if (action === 'subtract') {
            if (this.balances[counter] >= value) {
                this.balances[counter] -= value;
                this.showNotification(`Se restaron $TDL ${value.toLocaleString()} del contador ${this.getCounterName(counter)}`, 'success');
            } else {
                this.showNotification('Saldo insuficiente', 'error');
                return;
            }
        } else if (action === 'percentage') {
            this.showPercentageModal(counter, value);
        }

        this.updateBalances();
        this.saveBalances();
    }

    showPercentageModal(fromCounter, percentage) {
        const modal = document.getElementById('operationModal');
        const modalTitle = document.getElementById('modalTitle');
        const modalBody = document.getElementById('modalBody');

        modalTitle.textContent = `Transferir ${percentage}% del saldo`;
        
        const fromAmount = this.balances[fromCounter];
        const transferAmount = Math.floor(fromAmount * (percentage / 100));
        
        modalBody.innerHTML = `
            <p>Transferir <strong>$TDL ${transferAmount.toLocaleString()}</strong> desde <strong>${this.getCounterName(fromCounter)}</strong></p>
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
        `;

        modal.style.display = 'block';

        document.getElementById('confirmTransferBtn').addEventListener('click', () => {
            const toCounter = document.getElementById('transferTo').value;
            if (toCounter) {
                this.transferPercentage(fromCounter, toCounter, transferAmount);
                modal.style.display = 'none';
            } else {
                this.showNotification('Selecciona un contador de destino', 'error');
            }
        });
    }

    transferPercentage(fromCounter, toCounter, amount) {
        if (this.balances[fromCounter] >= amount) {
            this.balances[fromCounter] -= amount;
            this.balances[toCounter] += amount;
            this.showNotification(
                `Transferidos $TDL ${amount.toLocaleString()} de ${this.getCounterName(fromCounter)} a ${this.getCounterName(toCounter)}`, 
                'success'
            );
            this.updateBalances();
            this.saveBalances();
        } else {
            this.showNotification('Saldo insuficiente para la transferencia', 'error');
        }
    }

    getOtherCounters(excludeCounter) {
        return ['gallo', 'leon', 'perro', 'mano', 'estrella'].filter(c => c !== excludeCounter);
    }

    getCounterName(counter) {
        const names = {
            gallo: 'Gallo Azul',
            leon: 'Rey León',
            perro: 'Dálmata',
            mano: 'Guante',
            estrella: 'Brillante'
        };
        return names[counter];
    }

    updateBalances() {
        Object.keys(this.balances).forEach(counter => {
            const balanceElement = document.getElementById(`balance-${counter}`);
            balanceElement.textContent = `$TDL ${this.balances[counter].toLocaleString()}`;
        });
    }

    resetAllBalances() {
        if (confirm('¿Estás seguro de que quieres reiniciar todos los saldos a $TDL 10,000?')) {
            this.balances = {
                gallo: 10000,
                leon: 10000,
                perro: 10000,
                mano: 10000,
                estrella: 10000
            };
            this.updateBalances();
            this.saveBalances();
            this.showNotification('Todos los saldos han sido reiniciados a $TDL 10,000', 'success');
        }
    }

    showAmountModal() {
        const modal = document.getElementById('amountModal');
        Object.keys(this.balances).forEach(counter => {
            document.getElementById(`amount-${counter}`).value = this.balances[counter];
        });
        modal.style.display = 'block';
    }

    applyAmounts() {
        const newBalances = {};
        let hasChanges = false;

        Object.keys(this.balances).forEach(counter => {
            const newAmount = parseInt(document.getElementById(`amount-${counter}`).value);
            if (newAmount !== this.balances[counter]) {
                newBalances[counter] = newAmount;
                hasChanges = true;
            }
        });

        if (hasChanges) {
            this.balances = { ...this.balances, ...newBalances };
            this.updateBalances();
            this.saveBalances();
            this.showNotification('Montos actualizados correctamente', 'success');
            document.getElementById('amountModal').style.display = 'none';
        } else {
            this.showNotification('No hay cambios para aplicar', 'warning');
        }
    }

    showSwapModal() {
        const modal = document.getElementById('swapModal');
        modal.style.display = 'block';
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

    saveBalances() {
        localStorage.setItem('audacity_balances', JSON.stringify(this.balances));
    }

    loadBalances() {
        const saved = localStorage.getItem('audacity_balances');
        if (saved) {
            this.balances = JSON.parse(saved);
        }
        this.updateBalances();
    }
}

// Inicializar el juego cuando se carga la página
document.addEventListener('DOMContentLoaded', () => {
    window.game = new AudacityGame();
});

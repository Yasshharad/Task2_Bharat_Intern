// public/app.js
document.addEventListener('DOMContentLoaded', () => {
    const transactionForm = document.getElementById('transaction-form');
    const transactionsTable = document.getElementById('transactions-table');
    const typeFilter = document.getElementById('type-filter');
    const startDateFilter = document.getElementById('start-date-filter');
    const endDateFilter = document.getElementById('end-date-filter');
    const balanceAmount = document.getElementById('balance-amount');

    // Function to fetch and display transactions
    async function fetchTransactions() {
        try {
            const url = `http://localhost:4000/transactions?type=${typeFilter.value}&startDate=${startDateFilter.value}&endDate=${endDateFilter.value}`;
            const response = await fetch(url);
            const transactions = await response.json();

            // Clear existing table rows
            transactionsTable.innerHTML = '';
            transactionsTable.innerHTML = `
                <thead>
                    <tr>
                        <th>Date & Time</th>
                        <th>Description</th>
                        <th>Amount</th>
                        <th>Type</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="transactions-list"></tbody>
            `;

            let totalIncome = 0;
            let totalExpense = 0;

            transactions.forEach((transaction) => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td>${new Date(transaction.date).toLocaleString()}</td>
                    <td>${transaction.description}</td>
                    <td>₹${transaction.amount.toFixed(2)}</td>
                    <td>${transaction.type}</td>
                    <td>
                        <button onclick="editTransaction('${transaction._id}', '${transaction.description}', ${transaction.amount}, '${transaction.type}')">Edit</button>
                        <button onclick="deleteTransaction('${transaction._id}')">Delete</button>
                    </td>
                `;
                transactionsTable.querySelector('tbody').appendChild(tr);

                // Update totalIncome and totalExpense
                if (transaction.type === 'income') {
                    totalIncome += transaction.amount;
                } else {
                    totalExpense += transaction.amount;
                }
            });

            // Calculate balance
            const balance = totalIncome - totalExpense;
            balanceAmount.textContent = balance.toFixed(2);
        } catch (error) {
            console.error('Error fetching transactions:', error);
        }
    }

    // Handle form submission
    transactionForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const id = document.getElementById('transaction-id').value;
        const description = document.getElementById('description').value;
        const amount = document.getElementById('amount').value;
        const type = document.getElementById('type').value;

        if (description && amount && type) {
            const method = id ? 'PUT' : 'POST';
            const url = id ? `http://localhost:4000/transactions/${id}` : 'http://localhost:4000/transactions';

            try {
                const response = await fetch(url, {
                    method,
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ id, description, amount, type }),
                });

                if (response.ok) {
                    // Clear form fields and transaction ID
                    document.getElementById('transaction-id').value = '';
                    document.getElementById('description').value = '';
                    document.getElementById('amount').value = '';
                    document.getElementById('type').value = 'expense';

                    // Fetch and display updated transactions
                    fetchTransactions();
                } else {
                    const errorMessage = await response.json();
                    console.error(`Failed to add/update transaction: ${errorMessage.error}`);
                }
            } catch (error) {
                console.error('Error adding/updating transaction:', error);
            }
        }
    });

    // Add event listeners for filters
    typeFilter.addEventListener('change', () => fetchTransactions());
    startDateFilter.addEventListener('change', () => fetchTransactions());
    endDateFilter.addEventListener('change', () => fetchTransactions());

    // Initial fetch of transactions
    fetchTransactions();
});

// Function to edit a transaction
function editTransaction(id, description, amount, type) {
    document.getElementById('transaction-id').value = id;
    document.getElementById('description').value = description;
    document.getElementById('amount').value = amount;
    document.getElementById('type').value = type;
}

// Function to delete a transaction
async function deleteTransaction(id) {
    const confirmation = confirm('Are you sure you want to delete this transaction?');

    if (confirmation) {
        try {
            const url = `http://localhost:4000/transactions/${id}`;
            const response = await fetch(url, { method: 'DELETE' });

            if (response.ok) {
                // Fetch and display updated transactions
                fetchTransactions();
            } else {
                const errorMessage = await response.json();
                console.error(`Failed to delete transaction: ${errorMessage.error}`);
            }
        } catch (error) {
            console.error('Error deleting transaction:', error);
        }
    }
}
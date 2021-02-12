const Modal = {
  open() {
    document
    .querySelector('.modal-overlay')
    .classList
    .add('active')
  },
  close() {
    document
    .querySelector('.modal-overlay')
    .classList
    .remove('active')
  },
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('dev.finances:transactions')) || []
  },
  set(transactions) {
    localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
  },
}

const Transaction = {
  all: Storage.get(),

  add(transaction) {
    this.all.push(transaction);

    App.reload();
  },

  remove(index) {
    this.all.splice(index, 1);

    App.reload();
  },

  incomes() {
    let income = 0;
    this.all.forEach(transaction => {
      if(transaction.amount > 0) {
        income += transaction.amount
      }
    })
    return income;
  },

  expenses() {
    let expense = 0;
    this.all.forEach(transaction => {
      if(transaction.amount < 0) {
        expense += transaction.amount
      }
    })
    return expense;
  },

  total() {
    let total = 0;
    let income = this.incomes();
    let expense = this.expenses();

    return total = income + expense;;
  },
};

const DOM = {
  transactionsContainer: document.querySelector('.data-table tbody'),

  innerHTMLTransaction(transaction, index) {
    const CSSclass = transaction.amount > 0 ? 'income' : 'expense';
    const amount = Utils.formatCurrency(transaction.amount);

    const html = `
      <td class="description">${transaction.description}</td>
      <td class="${CSSclass}">${amount}</td>
      <td class="date">${transaction.date}</td>
      <td>
        <img onclick="Transaction.remove(${index})" src="./assets/minus.svg" alt="Remover transação">
      </td>
    `;

    return html;
  },

  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = this.innerHTMLTransaction(transaction, index);
    tr.dataset.index = index;

    this.transactionsContainer.appendChild(tr);
  },

  updateBalance() {
    document
      .querySelector('#incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.incomes())

    document
      .querySelector('#expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.expenses())

    document
      .querySelector('#totalDisplay')
      .innerHTML = Utils.formatCurrency(Transaction.total())
  },

  clearTransactions() {
    this.transactionsContainer.innerHTML = '';
  }
}

const Utils = {
  formatAmount(value) {
    value = Number(value) * 100;

    // Forma mais complexa, usando regex:
    // value = Number(value.replace(/\,\,/g, "")) * 100
    
    return value;
  },

  formatDate(date) {
    const splittedDate = date.split('-');

    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0 ? '-' : '';

    value = String(value).replace(/\D/g, ""); // regex que pega tudo que não seja número

    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });

    return signal + value;
  },

}

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: this.description.value,
      amount: this.amount.value,
      date: this.date.value,
    }
  },

  validateFields() {
    const { description, amount, date } = this.getValues();

    if( description.trim() === '' ||
        amount.trim() === '' ||
        date.trim() === ''
    ) {
      throw new Error('Por favor, preencha todos os campos.')
    };
  },

  formatValues() {
    let { description, amount, date } = this.getValues();

    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    };
  },

  saveTransaction(transaction) {
    Transaction.add(transaction);
  },

  clearFields() {
    this.description.value = '';
    this.amount.value = '';
    this.date.value = '';
  },

  submit(event) {
    event.preventDefault();

    try {
      this.validateFields();
      const transaction = this.formatValues();
      this.saveTransaction(transaction);  
      this.clearFields();
      Modal.close();
    } catch (error) {
      alert(error.message);
    }
  }
}


const App = {
  init() {
    Transaction.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    });
    
    DOM.updateBalance();

    Storage.set(Transaction.all);
  },
  reload() {
    DOM.clearTransactions();
    this.init();
  },
}


App.init();
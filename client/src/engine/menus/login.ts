import { Accept, Button } from '../gui/components/Buttons';
import InputPassword from '../gui/components/InputPassword';
import InputText from '../gui/components/InputText';
import Label from '../gui/components/Label';
import Menu from '../gui/components/Menu';
import Title from '../gui/components/Title';
import { InputElements } from '../gui/components/types';

const menu_id = 'login_menu';

enum INPUT_ELEMENTS {
  USERNAME = `${menu_id}_username_input`,
  PASSWORD = `${menu_id}_password_input`,
}
enum LABEL_ELEMENTS {
  USERNAME_LABEL = `${menu_id}_username_label`,
  PASSWORD_LABEL = `${menu_id}_password_label`,
}

const TITLE = `${menu_id}_title`;
const LOGIN = `${menu_id}_login_button`;
const REGISTER = `${menu_id}_cancel_button`;

export default class Login extends Menu {
  private _goToCharacterSelect: () => void;
  _shouldLogin: boolean = false;
  private _loginFormElements = {
    [TITLE]: new Title(TITLE, 'Dungeon Delvers'),
    [LABEL_ELEMENTS.USERNAME_LABEL]: new Label(LABEL_ELEMENTS.USERNAME_LABEL, 'Username:'),
    [INPUT_ELEMENTS.USERNAME]: new InputText(INPUT_ELEMENTS.USERNAME),
    [LABEL_ELEMENTS.PASSWORD_LABEL]: new Label(LABEL_ELEMENTS.PASSWORD_LABEL, 'Password:'),
    [INPUT_ELEMENTS.PASSWORD]: new InputPassword(INPUT_ELEMENTS.PASSWORD),
    [LOGIN]: new Accept(LOGIN, 'Login'),
    [REGISTER]: new Button(REGISTER, 'Register'),
  };
  constructor(_goToRegister: () => void, goToCharacterSelect: () => void) {
    super(menu_id, { width: '25%', height: '450px' });
    this.formElements = this._loginFormElements;
    this._goToCharacterSelect = goToCharacterSelect;
    Object.values(INPUT_ELEMENTS).map(value => {
      const input = this.formElements[value];
      input?.onBlurObservable.add(() => {
        this.validateInputs();
      });
    });
    (this.formElements[LOGIN] as Button).onClick = () => this.login();
    (this.formElements[REGISTER] as Button).onClick = () => _goToRegister();
  }
  private validateInputs() {
    this._shouldLogin = Object.values(INPUT_ELEMENTS).reduce((accumulator, value) => {
      const input = this.formElements[value] as InputElements;

      if (input) {
        accumulator = input.text !== '';
      }
      return accumulator;
    }, false);
  }
  private async login() {
    if (!this._shouldLogin) {
      const error = new Error('Please fill out all fields');
      error.name = 'LOGIN_ERROR';
      this.renderError(error);
      return;
    }
    const response = await fetch(
      `${process.env.AUTH_URL}${process.env.AUTH_PORT ? `:${process.env.AUTH_PORT}` : ''}/api/login`,
      {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: this._loginFormElements[INPUT_ELEMENTS.USERNAME].text,
          password: this._loginFormElements[INPUT_ELEMENTS.PASSWORD].text,
        }),
      },
    );

    if (response.ok) {
      const result = await response.json();
      // const socket = io(`${process.env.SERVER_URL}:${process.env.SERVER_PORT}`, {
      //   query: {
      //     token: result.token,
      //   },
      // });
      localStorage.setItem('dd_auth', JSON.stringify(result));
      this._goToCharacterSelect();
      Object.values(INPUT_ELEMENTS).map(value => {
        const input = this._loginFormElements[value];
        if (input) {
          input.text = '';
        }
      });
    } else {
      const { message } = await response.json();
      const error = new Error(message);
      error.name = 'LOGIN_ERROR';
      this.renderError(error);
    }
  }
}

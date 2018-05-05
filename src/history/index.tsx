import { typography } from 'nersent-ui';
import React from 'react';
import ReactDOM from 'react-dom';
import { injectGlobal } from 'styled-components';
import App from './components/App';

injectGlobal`
  body {
    user-select: none;
    cursor: default;
    ${typography.robotoRegular()}
    margin: 0;
    padding: 0;
    background-color: #f5f5f5;
  }
`;

async function setup() {
  ReactDOM.render(<App />, document.getElementById('app'));
}

setup();

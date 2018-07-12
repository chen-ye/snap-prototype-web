import React from 'react';
import ReactDOM from 'react-dom';
import ThreeManager from './ThreeManager';

import './index.css';
import 'semantic-ui-css/semantic.min.css';

import App from './App';
import registerServiceWorker from './registerServiceWorker';

ThreeManager.initalizeThree(document.getElementById('three-container'));

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();

import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { createStore } from 'redux';
import reducers from './reducers';
import { enableBatching } from 'redux-batched-actions';
import './index.scss';

const store = createStore(enableBatching(reducers));
const $main = document.querySelector('main');
const render = () => {
	const { default: App } = require('./containers/App');

	ReactDOM.render(
		<AppContainer>
			<Provider store={store}>
				<App />
			</Provider>
		</AppContainer>,
		$main
	);
};

render();
if (module.hot) {
	module.hot.accept(render);
}

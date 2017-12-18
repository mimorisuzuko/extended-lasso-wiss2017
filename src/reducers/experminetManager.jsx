import { ExperimentManager } from '../models';
import { handleActions } from 'redux-actions';
import actions from '../actions';

export default handleActions({
	[actions.startExperiment]: (state, { payload }) => {
		return state.start(payload);
	},
	[actions.selectBlocks]: (state, { payload }) => {
		return state.update('blocks', (blocks) => blocks.map((block, i) => {
			return block.set('selected', payload.get(i));
		}));
	},
	[actions.unselectBlocks]: (state) => {
		return state.update('blocks', (blocks) => blocks.map((block) => {
			return block.set('selected', false);
		}));
	},
	[actions.updateExperimentPattern]: (state, { payload }) => {
		return state.setCurrentBlocks(payload);
	}
}, new ExperimentManager());

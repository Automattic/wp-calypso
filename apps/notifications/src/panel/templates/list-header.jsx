import { connect } from 'react-redux';
import actions from '../state/actions';
import Gridicon from './gridicons';

export const ListHeader = ( { isFirst, title, viewSettings } ) => (
	<li className="wpnc__time-group-wrap">
		<div className="wpnc__time-group-title">
			<Gridicon icon="time" size={ 18 } />
			{ title }
			{ isFirst && <Gridicon icon="cog" size={ 18 } onClick={ viewSettings } /> }
		</div>
	</li>
);

const mapDispatchToProps = {
	viewSettings: actions.ui.viewSettings,
};

export default connect( null, mapDispatchToProps )( ListHeader );

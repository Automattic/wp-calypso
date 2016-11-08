/**
 * External dependencies
 */
import { connect } from 'react-redux';

/**
 * Internal dependencies
 */
import ThemeShowcase from './theme-showcase';
import {
	preview,
	signup,
	separator,
	info,
	support,
	help,
	bindOptionsToDispatch
} from './theme-options';

const mergeProps = ( stateProps, dispatchProps, ownProps ) => Object.assign(
	{},
	ownProps,
	stateProps,
	{
		options: dispatchProps,
		defaultOption: dispatchProps.signup,
		getScreenshotOption: () => dispatchProps.info
	}
);

export default connect(
	null,
	bindOptionsToDispatch( {
		signup,
		preview,
		separator,
		info,
		support,
		help
	}, 'showcase' ),
	mergeProps
)( ThemeShowcase );

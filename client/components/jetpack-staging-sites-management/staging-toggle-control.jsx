import { ToggleControl } from '@wordpress/components';
import PropTypes from 'prop-types';

const StagingToggleControl = ( { checked, loading, onChange } ) => {
	// @TODO: Let's add a loading indicator instead of just disabling it
	return <ToggleControl disabled={ loading } checked={ checked } onChange={ onChange } />;
};

StagingToggleControl.propTypes = {
	checked: PropTypes.bool,
	loading: PropTypes.bool,
	onChange: PropTypes.func,
};

export default StagingToggleControl;

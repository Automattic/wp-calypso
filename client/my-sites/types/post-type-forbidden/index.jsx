import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import whoopsImage from 'calypso/assets/images/illustrations/whoops.svg';
import EmptyContent from 'calypso/components/empty-content';

function PostTypeForbidden( { translate } ) {
	return (
		<EmptyContent
			illustration={ whoopsImage }
			title={ translate( 'You need permission to manage this post type' ) }
			line={ translate( 'Ask your site administrator to grant you access' ) }
		/>
	);
}

PostTypeForbidden.propTypes = {
	translate: PropTypes.func,
};

export default localize( PostTypeForbidden );

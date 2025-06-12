import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import EmptyContent from 'calypso/components/empty-content';

function PostTypeForbidden( { translate } ) {
	return (
		<EmptyContent
			title={ translate( 'You need permission to manage this post type' ) }
			line={ translate( 'Ask your site administrator to grant you access' ) }
		/>
	);
}

PostTypeForbidden.propTypes = {
	translate: PropTypes.func,
};

export default localize( PostTypeForbidden );

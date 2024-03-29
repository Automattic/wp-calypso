import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import DocumentHead from 'calypso/components/data/document-head';
import EmptyContent from 'calypso/components/empty-content';
import Main from 'calypso/components/main';
import { preventWidows } from 'calypso/lib/formatting';

const NoPermissionsError = ( { title, translate } ) => (
	<Main>
		{ title && <DocumentHead title={ title } /> }
		<EmptyContent
			title={ preventWidows( translate( "Oops! You don't have permission to manage plugins." ) ) }
			line={ preventWidows(
				translate( "If you think you should, contact this site's administrator." )
			) }
			illustration="/calypso/images/illustrations/error.svg"
		/>
	</Main>
);

NoPermissionsError.propTypes = {
	title: PropTypes.string,
	translate: PropTypes.func.isRequired,
};

export default localize( NoPermissionsError );

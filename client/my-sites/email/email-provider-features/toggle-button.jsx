import { Button, Gridicon } from '@automattic/components';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';

function EmailProviderFeaturesToggleButton( { handleClick, isRelatedContentExpanded } ) {
	const translate = useTranslate();

	return (
		<Button className="email-provider-features__toggle-button" onClick={ handleClick }>
			<span>{ translate( 'Learn more' ) }</span>

			<Gridicon icon={ isRelatedContentExpanded ? 'chevron-up' : 'chevron-down' } />
		</Button>
	);
}

EmailProviderFeaturesToggleButton.propTypes = {
	handleClick: PropTypes.func.isRequired,
	isRelatedContentExpanded: PropTypes.bool.isRequired,
};

export default EmailProviderFeaturesToggleButton;

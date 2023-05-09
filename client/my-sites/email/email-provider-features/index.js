import { Gridicon } from '@automattic/components';
import PropTypes from 'prop-types';
import { preventWidows } from 'calypso/lib/formatting';

import './style.scss';

function EmailProviderFeature( { title } ) {
	return (
		<div className="email-provider-features__feature">
			<Gridicon icon="checkmark" size="18" />

			{ preventWidows( title ) }
		</div>
	);
}

EmailProviderFeature.propTypes = {
	title: PropTypes.string.isRequired,
};

function EmailProviderFeatures( { features, logos } ) {
	if ( ! features ) {
		return null;
	}

	return (
		<div className="email-provider-features">
			{ features.filter( Boolean ).map( ( feature, index ) => (
				<EmailProviderFeature key={ index } title={ feature } />
			) ) }

			{ logos && (
				<div className="email-provider-features__logos">
					{ logos.map( ( { image, imageAltText, title }, index ) => (
						<img alt={ imageAltText } key={ index } src={ image } title={ title } />
					) ) }
				</div>
			) }
		</div>
	);
}

EmailProviderFeatures.propTypes = {
	features: PropTypes.arrayOf( PropTypes.oneOfType( [ PropTypes.node, PropTypes.string ] ) )
		.isRequired,
	logos: PropTypes.arrayOf( PropTypes.object ),
};

export default EmailProviderFeatures;

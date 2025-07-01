import { Gridicon } from '@automattic/components';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import InlineSupportLink from 'calypso/components/inline-support-link';
import './staging-site-creation-card-content.scss';

type CardContentProps = {
	isOwner: boolean;
};

export const StagingSiteCreationCardContent = ( { isOwner }: CardContentProps ) => {
	const { __ } = useI18n();
	const translate = useTranslate();

	const ownerMessage = translate(
		"We are setting up your staging site. We'll email you once it is ready."
	);
	const nonOwnerMessage = translate(
		"We are setting up the staging site. We'll email the site owner once it is ready."
	);
	const message = isOwner ? ownerMessage : nonOwnerMessage;

	return (
		<div className="staging-site-creation-card">
			<div className="staging-site-creation-card__content">
				<div className="staging-site-creation-card__title">
					{ __( 'Your staging site is being created' ) }
				</div>
				<div className="staging-site-creation-card__description">{ message }</div>
				<div className="staging-site-creation-card__features">
					{ [
						__( 'Test changes safely before going live.' ),
						__( 'Synchronized with your production site.' ),
						createInterpolateElement( __( 'Need help? <a>Contact our support team</a>.' ), {
							a: <InlineSupportLink supportContext="staging-site" showIcon={ false } />,
						} ),
					].map( ( text, index ) => (
						<div key={ index } className="staging-site-creation-card__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							{ text }
						</div>
					) ) }
				</div>
			</div>
			<div className="staging-site-creation-card__visual">
				<div className="staging-site-creation-card__spinner">
					<Gridicon icon="sync" size={ 24 } />
				</div>
			</div>
		</div>
	);
};

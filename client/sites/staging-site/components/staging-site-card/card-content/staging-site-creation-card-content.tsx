import { Gridicon } from '@automattic/components';
import { useI18n } from '@wordpress/react-i18n';
import { useTranslate } from 'i18n-calypso';
import './staging-site-creation-card-content.scss';

type CardContentProps = {
	isOwner: boolean;
};

export const StagingSiteCreationCardContent = ( { isOwner }: CardContentProps ) => {
	const { __ } = useI18n();
	const translate = useTranslate();

	const ownerMessage = translate(
		"We're currently creating your staging site. This may take a few moments, depending on the size of your site. We'll email you once it is ready."
	);
	const nonOwnerMessage = translate(
		"We're currently creating your staging site. This may take a few moments, depending on the size of your site. We'll email the site owner once it is ready."
	);
	const message = isOwner ? ownerMessage : nonOwnerMessage;

	return (
		<div className="staging-site-creation-card">
			<div className="staging-site-creation-card__content">
				<div className="staging-site-creation-card__title">{ __( 'Creating staging site' ) }</div>
				<div className="staging-site-creation-card__description">{ message }</div>
				<div className="staging-site-creation-card__features">
					{ [
						__( "Copying your existing site's content." ),
						__( 'Moving settings, and structure.' ),
						__( 'Creating a safe environment.' ),
					].map( ( text, index ) => (
						<div key={ index } className="staging-site-creation-card__feature">
							<Gridicon icon="checkmark" size={ 18 } />
							{ text }
						</div>
					) ) }
				</div>
			</div>
		</div>
	);
};

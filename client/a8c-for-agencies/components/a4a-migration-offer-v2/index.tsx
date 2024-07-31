import { Button } from '@wordpress/components';
import { Icon, chevronDown, external } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from '../a4a-contact-support-widget';
import ContainerIcon from './icon.svg';

import './style.scss';

const MigrationOfferV2 = () => {
	const translate = useTranslate();

	const [ isExpanded, setIsExpanded ] = useState( true );

	const onToggleView = useCallback( () => {
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [] );

	return (
		<div className={ clsx( 'a4a-migration-offer-v2', { 'is-expanded': isExpanded } ) }>
			<div className="a4a-migration-offer-v2__side">
				<img className="a4a-migration-offer-v2__icon" src={ ContainerIcon } alt="" />
			</div>

			<div className="a4a-migration-offer-v2__main">
				<h3 className="a4a-migration-offer-v2__title">
					{ translate( 'Special limited time migration offer' ) }

					<Button className="a4a-migration-offer-v2__view-toggle-mobile" onClick={ onToggleView }>
						<Icon icon={ chevronDown } size={ 24 } />
					</Button>
				</h3>

				{ isExpanded && (
					<div className="a4a-migration-offer-v2__body">
						<p className="a4a-migration-offer-v2__description">
							{ translate(
								'Migrate your clients’ sites to WordPress.com or Pressable hosting and earn 50% revenue share until June 30, 2025. You’ll also receive an additional $100 for each migrated site—up to $3,000 until September 30, 2024. {{a}}See details{{/a}}',
								{
									components: {
										a: (
											<a
												href="https://automattic.com/for-agencies/program-incentives"
												target="_blank"
												rel="noopener noreferrer"
											/>
										),
									},
								}
							) }
						</p>

						<Button
							className="a4a-migration-offer-v2__button"
							href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT }
						>
							{ translate( 'Contact us to start migrating' ) }
							<Icon icon={ external } size={ 18 } />
						</Button>
					</div>
				) }
			</div>

			<Button className="a4a-migration-offer-v2__view-toggle" onClick={ onToggleView }>
				<Icon icon={ chevronDown } size={ 24 } />
			</Button>
		</div>
	);
};

export default MigrationOfferV2;

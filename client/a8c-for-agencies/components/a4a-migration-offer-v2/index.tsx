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
					{ translate(
						'Limited time offer: Migrate your sites to Pressable or WordPress.com and earn up to $10,000!'
					) }

					<Button className="a4a-migration-offer-v2__view-toggle-mobile" onClick={ onToggleView }>
						<Icon icon={ chevronDown } size={ 24 } />
					</Button>
				</h3>

				{ isExpanded && (
					<div className="a4a-migration-offer-v2__body">
						<p className="a4a-migration-offer-v2__description">
							{ translate(
								'From now until the end of 2024, you’ll receive $100 for each migrated site, up to $10,000*. If you’re a WP Engine customer, we’ll also cover any costs of breaking your contract. {{a}}Full Terms ↗{{/a}}',
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
							{ translate( 'Contact us to learn more' ) }
							<Icon icon={ external } size={ 18 } />
						</Button>
					</div>
				) }
				<p className="a4a-migration-offer-v2__asterisk">
					{ translate(
						'* The migration limit is $10,000 for WP Engine and $3,000 for other hosts.'
					) }
				</p>
			</div>

			<Button className="a4a-migration-offer-v2__view-toggle" onClick={ onToggleView }>
				<Icon icon={ chevronDown } size={ 24 } />
			</Button>
		</div>
	);
};

export default MigrationOfferV2;

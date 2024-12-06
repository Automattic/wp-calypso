import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useState } from 'react';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from '../a4a-contact-support-widget';
import { A4A_MIGRATIONS_OVERVIEW_LINK } from '../sidebar-menu/lib/constants';
import SimpleList from '../simple-list';

import './style.scss';

const MigrationOfferV3 = () => {
	const translate = useTranslate();

	const [ isExpanded, setIsExpanded ] = useState( true );

	const onToggleView = useCallback( () => {
		setIsExpanded( ( isExpanded ) => ! isExpanded );
	}, [] );

	return (
		<div className={ clsx( 'a4a-migration-offer-v3', { 'is-expanded': isExpanded } ) }>
			<div className="a4a-migration-offer-v3__main">
				<h3 className="a4a-migration-offer-v3__title">
					{ translate(
						'{{b}}Limited time offer:{{/b}} Migrate your sites to Pressable or WordPress.com and earn up to $10,000!',
						{
							components: {
								b: <b />,
							},
						}
					) }

					<Button className="a4a-migration-offer-v3__view-toggle-mobile" onClick={ onToggleView }>
						<Icon icon={ chevronDown } size={ 24 } />
					</Button>
				</h3>

				{ isExpanded && (
					<div className="a4a-migration-offer-v3__body">
						<SimpleList
							items={ [
								translate(
									"{{b}}WP Engine customers:{{/b}} You will receive $100 per site, up to $10,000. You will also get credited for the remaining time on your WP Engine contract, so you won't have to pay twice.",
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									'{{b}}For any other host:{{/b}} You will receive $100 per site migrated up to a maximum of $3,000.',
									{
										components: {
											b: <b />,
										},
									}
								),
							] }
						/>

						<div className="a4a-migration-offer-v3__body-actions">
							<Button variant="primary" href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT }>
								{ translate( 'Contact us to learn more' ) }
							</Button>

							<Button variant="secondary" href={ A4A_MIGRATIONS_OVERVIEW_LINK }>
								{ translate( 'See full terms ↗' ) }
							</Button>

							<span className="a4a-migration-offer-v3__body-actions-footnote">
								{ translate( '* Offer valid until the end of 2024' ) }
							</span>
						</div>
					</div>
				) }
			</div>

			<Button className="a4a-migration-offer-v3__view-toggle" onClick={ onToggleView }>
				<Icon icon={ chevronDown } size={ 24 } />
			</Button>
		</div>
	);
};

export default MigrationOfferV3;

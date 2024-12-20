import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from '../a4a-contact-support-widget';
import { A4A_MIGRATIONS_OVERVIEW_LINK } from '../sidebar-menu/lib/constants';
import SimpleList from '../simple-list';

import './style.scss';

type Props = {
	isExpanded: boolean;
	onToggleView: () => void;
};

const MigrationOfferV3 = ( { isExpanded, onToggleView }: Props ) => {
	const translate = useTranslate();
	const dispatch = useDispatch();

	const onContactUsClick = useCallback(
		( e: React.MouseEvent< HTMLButtonElement > ) => {
			e.stopPropagation();
			dispatch( recordTracksEvent( 'a4a_migration_offer_contact_us_click' ) );
		},
		[ dispatch ]
	);

	const onSeeFullTermClick = useCallback( () => {
		dispatch( recordTracksEvent( 'a4a_migration_offer_see_full_terms_click' ) );
	}, [ dispatch ] );

	return (
		<div
			className={ clsx( 'a4a-migration-offer-v3', { 'is-expanded': isExpanded } ) }
			onClick={ onToggleView }
			role="button"
			tabIndex={ 0 }
			onKeyDown={ ( event ) => {
				if ( event.key === 'Enter' ) {
					onToggleView();
				}
			} }
		>
			<div className="a4a-migration-offer-v3__main">
				<h3 className="a4a-migration-offer-v3__title">
					<span>
						{ translate(
							'{{b}}Limited time offer:{{/b}} Migrate your sites to Pressable or WordPress.com and earn up to $10,000!',
							{
								components: {
									b: <b />,
								},
							}
						) }
					</span>

					<Button className="a4a-migration-offer-v3__view-toggle-mobile">
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
							<Button
								variant="primary"
								href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT }
								onClick={ onContactUsClick }
							>
								{ translate( 'Contact us to learn more' ) }
							</Button>

							<Button
								variant="secondary"
								href={ A4A_MIGRATIONS_OVERVIEW_LINK }
								onClick={ onSeeFullTermClick }
							>
								{ translate( 'See full terms ↗' ) }
							</Button>

							<span className="a4a-migration-offer-v3__body-actions-footnote">
								{ translate( '* offer valid until %(endDate)s', {
									args: {
										endDate: new Date( '2025-01-31T00:00:00' ).toLocaleDateString(
											translate.localeSlug,
											{
												year: 'numeric',
												month: 'long',
												day: 'numeric',
											}
										),
									},
								} ) }
							</span>
						</div>
					</div>
				) }
			</div>

			<Button className="a4a-migration-offer-v3__view-toggle">
				<Icon icon={ chevronDown } size={ 24 } />
			</Button>
		</div>
	);
};

export default MigrationOfferV3;

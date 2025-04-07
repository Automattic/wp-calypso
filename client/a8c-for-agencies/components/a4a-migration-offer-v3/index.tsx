import { Button } from '@wordpress/components';
import { Icon, chevronDown } from '@wordpress/icons';
import clsx from 'clsx';
import { useTranslate, formatCurrency } from 'i18n-calypso';
import { useCallback } from 'react';
import { useDispatch } from 'calypso/state';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from '../a4a-contact-support-widget';
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
							'{{b}}Limited time offer:{{/b}} Migrate your sites to Pressable or WordPress.com and earn up to %(maxCommission)s*',
							{
								components: {
									b: <b />,
								},
								args: {
									maxCommission: formatCurrency( 10000, 'USD', {
										stripZeros: true,
									} ),
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
									'{{b}}All migrations:{{/b}} Your first month of hosting will be free when you migrate twenty or more sites to us from any host.',
									{
										components: {
											b: <b />,
										},
									}
								),
								translate(
									"{{b}}WP Engine/Flywheel, Kinsta, Pantheon, Nexcess, or Pagely customers:{{/b}} You will receive %(commission)s per successful site migration up to %(maxCommission)s. If you have an existing contract, we'll host your site(s) for free until your existing WP Engine/Flywheel, Kinsta, Pantheon, Nexcess, or Pagely contract ends.",
									{
										components: {
											b: <b />,
										},
										args: {
											maxCommission: formatCurrency( 10000, 'USD', {
												stripZeros: true,
											} ),
											commission: formatCurrency( 100, 'USD', {
												stripZeros: true,
											} ),
										},
									}
								),
								translate(
									'{{b}}For any other host:{{/b}} You will receive %(commission)s per successful site migration, up to %(maxCommission)s.',
									{
										components: {
											b: <b />,
										},
										args: {
											maxCommission: formatCurrency( 3000, 'USD', {
												stripZeros: true,
											} ),
											commission: formatCurrency( 100, 'USD', {
												stripZeros: true,
											} ),
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
								href="https://automattic.com/for-agencies/program-incentives/"
								target="_blank"
								rel="noopener noreferrer"
								onClick={ onSeeFullTermClick }
							>
								{ translate( 'See full terms ↗' ) }
							</Button>

							<span className="a4a-migration-offer-v3__body-actions-footnote">
								{ translate( '*Offer valid until %(endDate)s', {
									args: {
										endDate: new Date( '2025-07-31T00:00:00' ).toLocaleDateString(
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

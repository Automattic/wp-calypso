import { Button, FoldableCard } from '@automattic/components';
import { Icon, reusableBlock, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import MigrationOfferIcon from 'calypso/assets/images/a8c-for-agencies/migration-icon.svg';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from '../a4a-contact-support-widget';

import './style.scss';
type Props = {
	foldable?: boolean;
};

const MigrationOfferHeader = ( { withIcon }: { withIcon?: boolean } ) => {
	const translate = useTranslate();
	const title = translate(
		'Limited time offer: Migrate your sites to Pressable or WordPress.com and earn up to $10,000!'
	);
	return (
		<div className="a4a-migration-offer__title">
			{ withIcon && (
				<img className="a4a-migration-offer__icon" src={ MigrationOfferIcon } alt="" />
			) }
			<h3>{ title }</h3>
		</div>
	);
};

const MigrationOfferBody = () => {
	const translate = useTranslate();
	const description = translate(
		'Receive $100 for each site you migrate to Pressable or WordPress.com, up to $10,000.* If you’re a WP\u00A0Engine customer, we’ll also credit the costs to set you free. {{a}}Full Terms ↗{{/a}}',
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
	);

	return (
		<>
			<p className="a4a-migration-offer__description">{ description }</p>
			<Button href={ CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } primary>
				{ translate( 'Contact us to learn more' ) }
				<Icon icon={ external } size={ 18 } />
			</Button>
			<p className="a4a-migration-offer__asterisk">
				{ translate(
					'* The migration limit is $10,000 for WP\u00A0Engine and $3,000 for other hosts. Offer valid until %(endDate)s',
					{
						args: {
							endDate: new Date( '2025-01-31T00:00:00' ).toLocaleDateString( translate.localeSlug, {
								year: 'numeric',
								month: 'long',
								day: 'numeric',
							} ),
						},
					}
				) }
			</p>
		</>
	);
};

const MigrationOffer = ( props: Props ) => {
	const { foldable } = props;

	return foldable ? (
		<FoldableCard
			className="a4a-migration-offer__wrapper"
			header={ <MigrationOfferHeader withIcon /> }
			expanded
			clickableHeader
			summary={ false }
		>
			<MigrationOfferBody />
		</FoldableCard>
	) : (
		<div className="a4a-migration-offer__wrapper non-foldable">
			<div className="a4a-migration-offer__aside">
				<Icon icon={ reusableBlock } size={ 24 } />
			</div>

			<div className="a4a-migration-offer__main">
				<MigrationOfferHeader />
				<MigrationOfferBody />
			</div>
		</div>
	);
};

export default MigrationOffer;

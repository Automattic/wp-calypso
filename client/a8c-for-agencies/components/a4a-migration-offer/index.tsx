import { Button, FoldableCard } from '@automattic/components';
import { Icon, reusableBlock, external } from '@wordpress/icons';
import { useTranslate } from 'i18n-calypso';
import { CONTACT_URL_FOR_MIGRATION_OFFER_HASH_FRAGMENT } from '../a4a-contact-support-widget';
import MigrationOfferIcon from './migration_icon.svg';

import './style.scss';
type Props = {
	foldable?: boolean;
};

const MigrationOfferHeader = ( { withIcon }: { withIcon?: boolean } ) => {
	const translate = useTranslate();
	const title = translate(
		'Limited time offer: Migrate your sites to Pressable or Wordpress.com and earn up to $10,000!'
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
		"From now until the end of 2024, you'll receive up to $100 for each migrated site to Pressable or WordPress.com, up to $10,000. If you're a WP Engine customer, we'll also cover any costs associated with breaking your contract. {{a}}Full Terms ↗{{/a}}",
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
				{ translate( 'Contact us for more information' ) }
				<Icon icon={ external } size={ 18 } />
			</Button>
			<p className="a4a-migration-offer__asterisk">
				{ translate(
					'* The $10k limit is for migrations from WP Engine to Pressable only. For migrations from other hosts the limit is $3k.'
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

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
					'* The $10k limit applies to migrations from WP Engine only; it is $3k for migrations from other hosts.'
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

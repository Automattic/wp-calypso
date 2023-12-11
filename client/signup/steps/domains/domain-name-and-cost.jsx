import { Button } from '@automattic/components';
import { translate } from 'i18n-calypso';
import { Component } from 'react';

// Referenced from WordAds_Ads_Txt
const wpcomSubdomains = [
	'wordpress.com',
	'art.blog',
	'business.blog',
	'car.blog',
	'code.blog',
	'data.blog',
	'design.blog',
	'family.blog',
	'fashion.blog',
	'finance.blog',
	'fitness.blog',
	'food.blog',
	'game.blog',
	'health.blog',
	'home.blog',
	'law.blog',
	'movie.blog',
	'music.blog',
	'news.blog',
	'photo.blog',
	'poetry.blog',
	'politics.blog',
	'school.blog',
	'science.blog',
	'sport.blog',
	'tech.blog',
	'travel.blog',
	'video.blog',
	'water.blog',
];

export function BoldTLD( { domain } ) {
	const split = domain.split( '.' );
	let tld = split.pop();
	const wp = split.pop();

	if ( wpcomSubdomains.includes( `${ wp }.${ tld }` ) ) {
		tld = `${ wp }.${ tld }`;
	}

	return (
		<>
			<span>{ domain.replace( `.${ tld }`, '' ) }</span>
			<b>.{ tld }</b>
		</>
	);
}

class DomainNameAndCost extends Component {
	constructor( props ) {
		super( props );
	}

	render() {
		const priceText = translate( '%(cost)s/year', {
			args: { cost: this.props.domain.item_original_cost_display },
		} );
		const costDifference = this.props.domain.item_original_cost - this.props.domain.cost;
		const hasPromotion = costDifference > 0;

		return this.props.isRemoving ? null : (
			<>
				<div>
					<div className="domains__domain-cart-domain">
						<BoldTLD domain={ this.props.domain.meta } />
					</div>
					<div className="domain-product-price__price">
						{ hasPromotion && <del>{ priceText }</del> }
						<span className="domains__price">{ this.props.domain.item_subtotal_display }</span>
					</div>
				</div>
				<div>
					{ hasPromotion && this.props.domain.item_subtotal === 0 && (
						<span className="savings-message">
							{ translate( 'Free for the first year with annual paid plans.' ) }
						</span>
					) }
					<Button
						borderless
						className="domains__domain-cart-remove"
						onClick={ this.props.removeDomainClickHandler( this.props.domain ) }
					>
						{ translate( 'Remove' ) }
					</Button>
				</div>
			</>
		);
	}
}

export default DomainNameAndCost;

import { Gridicon } from '@automattic/components';
import classNames from 'classnames';
import { ReactElement } from 'react';
import './style.scss';

export default function LicenseProductCard( props: any ): ReactElement {
	const {
		product: { label },
		orderIndex,
	} = props;
	const productTitle = label.replace( 'Jetpack ', '' ).replace( '(', '' ).replace( ')', '' );

	function handleKeyDown( e: any ) {
		if ( 32 === e.keyCode ) {
			props.onSelectProduct( props.product );
		}
	}

	return (
		<div
			onClick={ () => props.onSelectProduct( props.product ) }
			onKeyDown={ ( e ) => handleKeyDown( e ) }
			role="radio"
			tabIndex={ orderIndex + 100 }
			aria-checked={ props.isSelected }
			className={ classNames( {
				'license-product-card': true,
				selected: props.isSelected,
			} ) }
		>
			<div className="license-product-card__inner">
				<div className="license-product-card__details">
					<div className="license-product-card__top">
						<h3 className="license-product-card__title">{ productTitle }</h3>
						<div className="license-product-card__radio">
							{ props.isSelected && <Gridicon icon="checkmark" /> }
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}

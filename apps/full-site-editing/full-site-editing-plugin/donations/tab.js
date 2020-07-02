/**
 * WordPress dependencies
 */
import { __experimentalBlock as Block, RichText } from '@wordpress/block-editor';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import Context from './context';
import formatCurrency, { CURRENCIES } from '@automattic/format-currency';
import { minimumTransactionAmountForCurrency } from '../premium-content/blocks/container';

const attributesPerInterval = {
	heading: {
		'one-time': 'oneTimeHeading',
		'1 month': 'monthlyHeading',
		'1 year': 'annualHeading',
	},
	buttonText: {
		'one-time': 'oneTimeButtonText',
		'1 month': 'monthlyButtonText',
		'1 year': 'annualButtonText',
	},
};

const Tab = ( props ) => {
	const { attributes, interval, setAttributes } = props;

	const getAttribute = ( attributeName ) => {
		if ( attributeName in attributesPerInterval ) {
			return attributes[ attributesPerInterval[ attributeName ][ interval ] ];
		}
		return attributes[ attributeName ];
	};

	const setAttribute = ( attributeName, value ) => {
		if ( attributeName in attributesPerInterval ) {
			return setAttributes( {
				[ attributesPerInterval[ attributeName ][ interval ] ]: value,
			} );
		}
		return setAttributes( { [ attributeName ]: value } );
	};
	const currency = getAttribute( 'currency' );

	const minAmount = minimumTransactionAmountForCurrency( currency );
	// TODO: This generates good amounts for USD, but let's revisit once we support more currencies.
	const tiers = [
		minAmount * 10, // USD 5
		minAmount * 30, // USD 15
		minAmount * 200, // USD 100
	];
	const customAmountPlaceholder = minAmount * 100; // USD 50

	return (
		<Context.Consumer>
			{ ( { activeTab } ) => (
				<div hidden={ activeTab !== interval }>
					<RichText
						tagName={ Block.h4 }
						placeholder={ __( 'Write a message…', 'full-site-editing' ) }
						value={ getAttribute( 'heading' ) }
						onChange={ ( value ) => setAttribute( 'heading', value ) }
						inlineToolbar
					/>
					<RichText
						tagName={ Block.p }
						placeholder={ __( 'Write a message…', 'full-site-editing' ) }
						value={ getAttribute( 'chooseAmountText' ) }
						onChange={ ( value ) => setAttribute( 'chooseAmountText', value ) }
						inlineToolbar
					/>
					<div className="wp-block-buttons donations__amounts">
						{ tiers.map( ( amount ) => (
							<div className="wp-block-button donations__amount">
								<div className="wp-block-button__link">{ formatCurrency( amount, currency ) }</div>
							</div>
						) ) }
					</div>
					{ getAttribute( 'showCustomAmount' ) && (
						<>
							<RichText
								tagName={ Block.p }
								placeholder={ __( 'Write a message…', 'full-site-editing' ) }
								value={ getAttribute( 'customAmountText' ) }
								onChange={ ( value ) => setAttribute( 'customAmountText', value ) }
								inlineToolbar
							/>
							<div className="wp-block-button donations__amount donations__custom-amount">
								<div className="wp-block-button__link">
									{ CURRENCIES[ currency ].symbol }
									<span className="donations__custom-amount-placeholder">
										{ formatCurrency( customAmountPlaceholder, currency, { symbol: '' } ) }
									</span>
								</div>
							</div>
						</>
					) }
					<div className="donations__separator">——</div>
					<RichText
						tagName={ Block.p }
						placeholder={ __( 'Write a message…', 'full-site-editing' ) }
						value={ getAttribute( 'extraText' ) }
						onChange={ ( value ) => setAttribute( 'extraText', value ) }
						inlineToolbar
					/>
					<RichText
						wrapperClassName="wp-block-button"
						className="wp-block-button__link"
						placeholder={ __( 'Write a message…', 'full-site-editing' ) }
						value={ getAttribute( 'buttonText' ) }
						onChange={ ( value ) => setAttribute( 'buttonText', value ) }
						inlineToolbar
					/>
				</div>
			) }
		</Context.Consumer>
	);
};

export default Tab;

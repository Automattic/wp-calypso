import { Gridicon } from '@automattic/components';
import { CheckboxControl, Button, TextControl } from '@wordpress/components';
import { translate } from 'i18n-calypso';
import { useState } from 'react';
import './styles.scss';

export function GetReportForm() {
	const [ name, setName ] = useState( '' );
	const [ email, setEmail ] = useState( '' );
	return (
		<div className="get-report-form__container">
			<div className="get-report-form__title">
				<span className="title">{ translate( 'Get full report' ) }</span>
			</div>
			<div className="get-report-form__body">
				<div className="get-report-form__header">
					<span className="description">
						{ translate(
							'Enter your details below to receive the full report with detailed insights and recommendations for your site.'
						) }
					</span>
					<span>
						<svg
							width="20"
							height="13"
							viewBox="0 0 20 13"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M17.0741 0.16626L9.75322 7.8889L2.43236 0.16626L0.183472 2.54375L9.75322 12.6607L19.323 2.54375L17.0741 0.16626Z"
								fill="#3858E9"
							/>
						</svg>
					</span>
				</div>
				<div className="get-report-form__form">
					<TextControl
						className="get-report-form__form-name"
						label={ translate( 'Name' ) }
						value={ name }
						onChange={ setName }
					/>
					<TextControl
						className="get-report-form__form-email"
						label={ translate( 'Email' ) }
						value={ email }
						onChange={ setEmail }
					/>
				</div>
				<div className="get-report-form__footer">
					<CheckboxControl
						className="terms-checkbox"
						onChange={ () => {} }
						label={ translate(
							`By submitting your details, you agree to WordPress.com‘s Privacy Policy and Terms of Service. You also consent to receiving occasional updates and offers. You can unsubscribe from these communications at any time through the instructions.`
						) }
					/>
					<Button type="submit" className="submit-button">
						{ translate( 'Get my report' ) }
						<Gridicon icon="product-downloadable" />
					</Button>
				</div>
			</div>
		</div>
	);
}

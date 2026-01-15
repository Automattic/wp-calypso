import { useTranslate } from 'i18n-calypso';

interface SuccessMessageProps {
	clientTitle: string;
}

const SuccessMessage = ( { clientTitle }: SuccessMessageProps ) => {
	const translate = useTranslate();

	return (
		<div className="oauth2-connect__success" role="status" aria-live="polite">
			<svg
				className="oauth2-connect__success-icon"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 50 50"
				aria-hidden="true"
			>
				<circle style={ { fill: '#008A20' } } cx="25" cy="25" r="25" />
				<polyline
					style={ {
						fill: 'none',
						stroke: '#FFFFFF',
						strokeWidth: 5,
						strokeLinecap: 'round',
						strokeLinejoin: 'round',
					} }
					points="38,15 22,33 12,25"
				/>
			</svg>
			<div className="oauth2-connect__success-content">
				<div className="oauth2-connect__success-title">
					{ translate( 'Success! You can return to %(client)s', {
						args: { client: clientTitle },
					} ) }
				</div>
				<div className="oauth2-connect__success-description">
					{ translate( 'You have successfully connected your WordPress.com account.' ) }
				</div>
			</div>
		</div>
	);
};

export default SuccessMessage;

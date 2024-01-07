import './style.scss';

interface DefaultThankYouHeaderContainerProps {
	title: React.ReactNode;
	subtitle: React.ReactNode;
	buttons?: React.ReactNode;
}

const ThankYouHeader: React.FC< DefaultThankYouHeaderContainerProps > = ( {
	title,
	subtitle,
	buttons,
} ) => {
	return (
		<div className="checkout-thank-you__header">
			<h1 className="checkout-thank-you__header-heading">{ title }</h1>
			<h2 className="checkout-thank-you__header-text">{ subtitle }</h2>
			{ buttons && <div className="checkout-thank-you__header-buttons">{ buttons }</div> }
		</div>
	);
};

export default ThankYouHeader;

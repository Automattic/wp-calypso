import './style.scss';

export default function StoredCreditCardLoading(): JSX.Element {
	return (
		<div className="stored-credit-card stored-credit-card-loading">
			<div className="stored-credit-card-loading__top stored-credit-card-loading--placeholder" />
			<div className="stored-credit-card-loading__bottom">
				<div className="stored-credit-card-loading__cardholder stored-credit-card-loading--placeholder" />
				<div className="stored-credit-card-loading__card stored-credit-card-loading--placeholder" />
			</div>
		</div>
	);
}

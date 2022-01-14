/* eslint-disable wpcalypso/jsx-classname-namespace */

const DnsRecordItemPlaceholder = (): JSX.Element => {
	return (
		<div className="dns-record-item is-placeholder">
			<div className="dns-record-item__type" />
			<div className="dns-record-item__name" />
			<div className="dns-record-item__value" />
		</div>
	);
};

export default DnsRecordItemPlaceholder;

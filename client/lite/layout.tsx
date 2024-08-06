import CalypsoI18nProvider from 'calypso/components/calypso-i18n-provider';
const Layout = ( { primary, secondary } ) => {
	return (
		<CalypsoI18nProvider>
			<div id="content">
				<div id="primary">{ primary }</div>
				<div id="secondary">{ secondary }</div>
			</div>
		</CalypsoI18nProvider>
	);
};

export default Layout;

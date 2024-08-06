const Layout = ( { primary, secondary } ) => {
	return (
		<div id="content">
			<div id="primary">{ primary }</div>
			<div id="secondary">{ secondary }</div>
		</div>
	);
};

export default Layout;

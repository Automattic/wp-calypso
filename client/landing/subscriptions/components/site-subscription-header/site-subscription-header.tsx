import Breadcrumb from 'calypso/components/breadcrumb';
const SiteSubscriptionHeader = () => {
	return (
		<header>
			<Breadcrumb
				items={ [ { label: 'Random' }, { label: 'Manage all subscriptions' } ] }
				compact={ true }
				mobileItem={ { label: 'Manage all subscriptions' } }
			/>
			Site subscription header
		</header>
	);
};

export default SiteSubscriptionHeader;

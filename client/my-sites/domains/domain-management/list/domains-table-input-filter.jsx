import { Component } from 'react';
import Search from 'calypso/components/search';

class DomainsTableInputFilter extends Component {
	render() {
		return (
			<Search
				additionalClasses="all-domains__search-input"
				id="all-domains__search-input"
				name="all-domains__search-input"
				placeholder="Search for a domain..."
				onSearch={ this.props.onSearch }
				delayTimeout={ 1000 }
				delaySearch
				isOpen={ true }
			/>
		);
	}
}

export default DomainsTableInputFilter;

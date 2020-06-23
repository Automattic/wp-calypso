/**
 * External dependencies
 */
import page from 'page';
import React, { Component } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal Dependencies
 */
import { Card } from '@wordpress/components';
import Header from 'my-sites/domains/domain-management/components/header';
import VerticalNav from 'components/vertical-nav';
import { DomainManagementNavigationItem } from 'my-sites/domains/domain-management/edit/navigation/navitem';

class DomainUsage extends Component {
	back = () => {
		page( '/domains/add' );
	};

	header() {
		return (
			<Header onClick={ this.back } selectedDomainName="something">
				{ this.props.translate( 'Domain purchase' ) }
			</Header>
		);
	}

	render() {
		return (
			<React.Fragment>
				{ this.header() }
				<Card>
					<div>
						<p>
							How would you like to use <strong>fditrapani.blog</strong>?
						</p>
					</div>
					<VerticalNav>
						<DomainManagementNavigationItem
							path={ 'aaaa' }
							gridicon="create"
							text={ 'Point it to a new WordPress.com site' }
							description={ 'Get your domain free for a year with all plans' }
						/>
						<DomainManagementNavigationItem
							path={ 'aaaa' }
							gridicon="my-sites"
							text={ 'Point it to an existing WordPress.com site' }
							description={ 'Get your domain free for a year with all plans' }
						/>
						<DomainManagementNavigationItem
							path={ 'aaaa' }
							gridicon="checkmark"
							text={ 'Park it' }
							description={ 'Get your domain free for a year with all plans' }
						/>
					</VerticalNav>
				</Card>
			</React.Fragment>
		);
	}
}

export default localize( DomainUsage );

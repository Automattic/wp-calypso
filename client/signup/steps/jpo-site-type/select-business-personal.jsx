import React from 'react';

import { translate } from 'i18n-calypso';
import Card from 'components/card';
import Button from 'components/button';

import PersonalGraphic from './personal-graphic';
import BusinessGraphic from './business-graphic';

module.exports = React.createClass( {

	displayName: 'SelectBusinessPersonal',

	propTypes: {
		required: React.PropTypes.bool,
	},

	render: function() {
		if ( ! this.props.current ) {
			return ( <div /> );
		}

		return ( 
			<div className="jpo__site-type-wrapper">
				<div className="jpo__site-type-row jpo__site-type-row-small">
					<Card>
						<PersonalGraphic />
						<Button onClick={ this.props.onSelectPersonal }>{ translate( 'Personal site' ) }</Button>
					</Card>
					<Card>
						<BusinessGraphic />
						<Button onClick={ this.props.onSelectBusiness }>{ translate( 'Business site' ) }</Button>
					</Card>
				</div>
			</div>
		);
	}

} );

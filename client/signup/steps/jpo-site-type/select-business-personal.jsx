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
					<div className="card design-type-with-store__choice">
						<a className="design-type-with-store__choice-link:after" href="#"
						onClick={ this.props.onSelectPersonal }>
						<div className="design-type-with-store__image">
						<PersonalGraphic />
						</div>
						<div className="design-type-with-store__choice-copy">
						<span className="button is-compact design-type-with-store__cta"
						onClick={ this.props.onSelectPersonal }>{ translate( 'Personal site' ) }</span>
						</div>
						</a>
					</div>
					<div className="card design-type-with-store__choice">
						<a className="design-type-with-store__choice-link:after" href="#"
						onClick={ this.props.onSelectBusiness }>
						<div className="design-type-with-store__image">
						<BusinessGraphic />
						</div>
						<div className="design-type-with-store__choice-copy">
						<span className="button is-compact design-type-with-store__cta"
						onClick={ this.props.onSelectBusiness }>{ translate( 'Business site' ) }</span>
						</div>
						</a>
					</div>
				</div>
			</div>
		);
	}

} );

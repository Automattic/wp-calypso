/** @format */

/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ButtonGroup from 'components/button-group';
import Button from 'components/button';
import Card from 'components/card';
import GridiconCalendar from 'gridicons/dist/calendar';
import GridiconHistory from 'gridicons/dist/history';
import GridiconBriefcase from 'gridicons/dist/briefcase';
import GridiconHeart from 'gridicons/dist/heart';
import GridiconAddImage from 'gridicons/dist/add-image';

class Buttons extends React.PureComponent {
	static displayName = 'ButtonGroup';

	state = {
		compact: false,
	};

	toggleButtons = () => {
		this.setState( { compact: ! this.state.compact } );
	};

	render() {
		return (
			<div>
				<a className="docs__design-toggle button" onClick={ this.toggleButtons }>
					{ this.state.compact ? 'Normal Buttons' : 'Compact Buttons' }
				</a>
				<Card>
					<div className="docs__design-button-group-row">
						<ButtonGroup>
							<Button compact={ this.state.compact }>Do thing</Button>
							<Button compact={ this.state.compact }>Do another thing</Button>
						</ButtonGroup>
					</div>
					<div className="docs__design-button-group-row">
						<ButtonGroup>
							<Button compact={ this.state.compact }>Button one</Button>
							<Button compact={ this.state.compact }>Button two</Button>
							<Button compact={ this.state.compact } scary>
								Button Three
							</Button>
						</ButtonGroup>
					</div>
					<div className="docs__design-button-group-row">
						<ButtonGroup>
							<Button compact={ this.state.compact }>
								<GridiconAddImage />
							</Button>
							<Button compact={ this.state.compact }>
								<GridiconHeart />
							</Button>
							<Button compact={ this.state.compact }>
								<GridiconBriefcase />
							</Button>
							<Button compact={ this.state.compact }>
								<GridiconHistory />
							</Button>
						</ButtonGroup>
					</div>
					<div className="docs__design-button-group-row">
						<ButtonGroup>
							<Button primary compact={ this.state.compact }>
								Publish
							</Button>
							<Button primary compact={ this.state.compact }>
								<GridiconCalendar />
							</Button>
						</ButtonGroup>
					</div>

					<div className="docs__design-button-group-row">
						<ButtonGroup busy>
							<Button compact={ this.state.compact }>Busy</Button>
							<Button compact={ this.state.compact }>
								<GridiconCalendar />
							</Button>
						</ButtonGroup>

						<ButtonGroup busy primary>
							<Button primary compact={ this.state.compact }>
								Primary Busy
							</Button>
							<Button primary compact={ this.state.compact }>
								<GridiconCalendar />
							</Button>
						</ButtonGroup>
					</div>
				</Card>
			</div>
		);
	}
}

export default Buttons;

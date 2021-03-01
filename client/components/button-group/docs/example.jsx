/**
 * External dependencies
 */

import React from 'react';

/**
 * Internal dependencies
 */
import ButtonGroup from 'calypso/components/button-group';
import { Button, Card } from '@automattic/components';
import Gridicon from 'calypso/components/gridicon';

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
								<Gridicon icon="add-image" />
							</Button>
							<Button compact={ this.state.compact }>
								<Gridicon icon="heart" />
							</Button>
							<Button compact={ this.state.compact }>
								<Gridicon icon="briefcase" />
							</Button>
							<Button compact={ this.state.compact }>
								<Gridicon icon="history" />
							</Button>
						</ButtonGroup>
					</div>
					<div className="docs__design-button-group-row">
						<ButtonGroup>
							<Button primary compact={ this.state.compact }>
								Publish
							</Button>
							<Button primary compact={ this.state.compact }>
								<Gridicon icon="calendar" />
							</Button>
						</ButtonGroup>
					</div>

					<div className="docs__design-button-group-row">
						<ButtonGroup busy>
							<Button compact={ this.state.compact }>Busy</Button>
							<Button compact={ this.state.compact }>
								<Gridicon icon="calendar" />
							</Button>
						</ButtonGroup>

						<ButtonGroup busy primary>
							<Button primary compact={ this.state.compact }>
								Primary Busy
							</Button>
							<Button primary compact={ this.state.compact }>
								<Gridicon icon="calendar" />
							</Button>
						</ButtonGroup>
					</div>
				</Card>
			</div>
		);
	}
}

export default Buttons;

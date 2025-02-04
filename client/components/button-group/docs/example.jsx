import { Button, Card, Gridicon } from '@automattic/components';
import { PureComponent } from 'react';
import ButtonGroup from 'calypso/components/button-group';

class Buttons extends PureComponent {
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
				{ /* eslint-disable-next-line jsx-a11y/anchor-is-valid, jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */ }
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

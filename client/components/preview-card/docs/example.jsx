/**
 * External dependencies
 */
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import PreviewCard from 'components/preview-card';
import PreviewCardContent from 'components/preview-card/preview-card-content';
import PreviewCardContentElement from 'components/preview-card/preview-card-content-element';
import PreviewCardHeader from 'components/preview-card/preview-card-header';
import PreviewCardHeaderElement from 'components/preview-card/preview-card-header-element';

class PreviewCardExample extends Component {
	state = {
		isExpanded: false,
	};

	toggleExpanded = () => this.setState( { isExpanded: ! this.state.isExpanded } );

	getActions = () => [
		{
			icon: 'star',
			label: 'Like',
			onClick: () => console.log( 'PreviewCardExample like' ),
		},
		{
			icon: 'trash',
			label: 'Trash',
			onClick: () => console.log( 'PreviewCardExample trash' ),
		},
	];

	getHeader = () =>
		<PreviewCardHeader onClick={ this.toggleExpanded }>
			<PreviewCardHeaderElement>
				<img
					src="https://secure.gravatar.com/blavatar/e6392390e3bcfadff3671c5a5653d95b?s=240"
					style={ { height: '24px', verticalAlign: 'middle' } }
				/>
				<strong>Username</strong>
			</PreviewCardHeaderElement>
			<PreviewCardHeaderElement>
				Preview content
			</PreviewCardHeaderElement>
		</PreviewCardHeader>;

	render() {
		const { isExpanded } = this.state;

		return(
			<PreviewCard
				actions={ this.getActions() }
				header={ this.getHeader() }
				isExpanded={ isExpanded }
				toggleExpanded={ this.toggleExpanded }
			>
				<PreviewCardContent>
					<PreviewCardContentElement>
						A PreviewCard Element
					</PreviewCardContentElement>
					<PreviewCardContentElement>
						Another PreviewCard Element
					</PreviewCardContentElement>
				</PreviewCardContent>
			</PreviewCard>
		);
	}
}

export const PreviewCardExampleList = () =>
	<div>
		<PreviewCardExample />
		<PreviewCardExample />
		<PreviewCardExample />
	</div>;

PreviewCardExampleList.displayName = 'PreviewCard';

export default PreviewCardExampleList;

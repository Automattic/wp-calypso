import { Button, Gridicon } from '@automattic/components';
import { addQueryArgs } from '@wordpress/url';
import classnames from 'classnames';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { Component } from 'react';
import { connect } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions';
import getEditorUrl from 'calypso/state/selectors/get-editor-url';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import './style.scss';

export class PromptsNavigation extends Component {
	static propTypes = {
		prompts: PropTypes.array,
		editorUrl: PropTypes.string,
		backIcon: PropTypes.string,
		forwardIcon: PropTypes.string,
	};

	static defaultProps = {
		prompts: null,
		editorUrl: '',
		backIcon: 'arrow-left',
		forwardIcon: 'arrow-right',
	};

	state = {
		promptIndex: 0,
	};

	navigatePrompts = ( direction ) => {
		if ( direction === 'forward' ) {
			this.goToNextStep();
		} else {
			this.goToPreviousStep();
		}
	};

	trackSkippedBloggingPrompt() {
		const todayPromptId = this.props.prompts[ 0 ].id;
		const skippedPromptId = this.getPrompt().id;
		if ( todayPromptId !== skippedPromptId ) {
			recordTracksEvent( `calypso_customer_home_skip_prompt`, {
				site_id: this.props.siteId,
				prompt_id: skippedPromptId,
			} );
		}
	}

	trackBloggingPromptClick() {
		recordTracksEvent( `calypso_customer_home_answer_prompt`, {
			site_id: this.props.siteId,
			prompt_id: this.getPrompt().id,
		} );

		this.trackSkippedBloggingPrompt();
	}

	getPrompt = () => {
		return this.props.prompts !== undefined ? this.props.prompts[ this.state.promptIndex ] : null;
	};

	setPromptIndex = ( index ) => {
		this.setState( { promptIndex: index } );
	};

	goToPreviousStep = () => {
		let nextIndex = this.state.promptIndex - 1;
		if ( nextIndex <= 1 ) {
			nextIndex = 0;
		}
		this.setPromptIndex( nextIndex );
	};

	goToNextStep = () => {
		const maxIndex = this.props.prompts.length - 1;
		let nextIndex = this.state.promptIndex + 1;
		if ( nextIndex > maxIndex ) {
			nextIndex = maxIndex;
		}
		this.setPromptIndex( nextIndex );
	};

	render() {
		const { editorUrl, backIcon, forwardIcon } = this.props;

		const buttonClasses = classnames(
			'navigation-link',
			this.props.direction,
			this.props.cssClass
		);

		const newPostLink = addQueryArgs( editorUrl, {
			answer_prompt: this.getPrompt().id,
		} );

		return (
			<div className="blogging-prompt__prompt-container">
				<div className="blogging-prompt__prompt-navigation">
					<Button
						borderless={ false }
						className={ buttonClasses }
						onClick={ () => this.navigatePrompts( 'back' ) }
						disabled={ this.state.promptIndex === 0 }
					>
						<Gridicon icon={ backIcon } size={ 18 } />
					</Button>
					<div className="blogging-prompt__prompt-text">{ this.getPrompt().text }</div>
					<Button
						borderless={ false }
						className={ buttonClasses }
						onClick={ () => this.navigatePrompts( 'forward' ) }
						disabled={ this.state.promptIndex >= this.props.prompts?.length - 1 }
					>
						<Gridicon icon={ forwardIcon } size={ 18 } />
					</Button>
				</div>
				<div className="blogging-prompt__prompt-answers">
					<Button
						href={ newPostLink }
						onClick={ () => this.trackBloggingPromptClick() }
						target="_blank"
					>
						{ this.props.translate( 'Post Answer', {
							comment:
								'"Post" here is a verb meaning "to publish", as in "post an answer to this writing prompt"',
						} ) }
					</Button>
				</div>
			</div>
		);
	}
}

const mapStateToProps = ( state ) => {
	const siteId = getSelectedSiteId( state );
	return {
		siteId,
		editorUrl: getEditorUrl( state, siteId ),
	};
};

export default connect( mapStateToProps )( localize( PromptsNavigation ) );

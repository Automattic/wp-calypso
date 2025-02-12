import { PureComponent } from 'react';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';

class Notices extends PureComponent {
	static displayName = 'Notice';

	state = {
		compactNotices: false,
	};

	render() {
		const toggleNoticesText = this.state.compactNotices ? 'Normal Notices' : 'Compact Notices';

		return (
			<div>
				<button className="docs__design-toggle button" onClick={ this.toggleNotices }>
					{ toggleNoticesText }
				</button>

				<div>
					<Notice showDismiss={ false } isCompact={ this.state.compactNotices ? true : null }>
						I'm a notice with no status and <a href="#link">a link</a>.
					</Notice>
				</div>
				<div>
					<Notice
						text="I'm a notice with no status and an action."
						showDismiss={ false }
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">Update</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-info"
						text="I'm an `is-info` notice with custom icon."
						icon="heart"
						isCompact={ this.state.compactNotices ? true : null }
					/>
				</div>
				<div>
					<Notice
						status="is-info"
						showDismiss={ false }
						text="I'm an `is-info` notice with custom icon and an action."
						icon="heart"
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">Update</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-success"
						text="I'm an `is-success` notice."
						isCompact={ this.state.compactNotices ? true : null }
					/>
				</div>
				<div>
					<Notice
						status="is-error"
						showDismiss={ false }
						text="I'm an `is-error` notice."
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">Update</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-warning"
						icon="ellipsis-circle"
						text="I'm an `is-warning` notice with custom icon and an action."
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">Update</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-warning"
						isCompact={ this.state.compactNotices ? true : null }
						showDismiss={ false }
						text="I'm an `is-warning` notice."
					/>
				</div>
				<div>
					<Notice
						status="is-success"
						isCompact={ this.state.compactNotices ? true : null }
						showDismiss={ false }
						text="I'm an `is-success` notice with an arrow link."
					>
						<NoticeAction href="#" external>
							Preview
						</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-error"
						showDismiss
						text="I'm an always dismissable error notice."
						isCompact={ this.state.compactNotices ? true : null }
					>
						<NoticeAction href="#">More</NoticeAction>
					</Notice>
				</div>
				<div>
					<Notice
						status="is-info"
						icon="reader"
						isLoading
						text="I'm a notice that's loading…"
						showDismiss={ false }
						isCompact={ this.state.compactNotices ? true : null }
					/>
				</div>
				<div>
					<Notice
						status="is-transparent-info"
						showDismiss={ false }
						text="I'm an `is-transparent-info` notice."
						isCompact={ this.state.compactNotices ? true : null }
					/>
				</div>
			</div>
		);
	}

	toggleNotices = () => {
		this.setState( { compactNotices: ! this.state.compactNotices } );
	};
}

export default Notices;

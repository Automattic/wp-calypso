import './styles.scss';

const BlueskyPostActions: React.FC = () => (
	<div className="bluesky-preview__post-actions">
		<div>
			<svg
				fill="none"
				width="18"
				viewBox="0 0 24 24"
				height="18"
				style={ { color: 'rgb(111, 134, 159)' } }
				aria-hidden="true"
			>
				<path
					fill="hsl(211, 20%, 53%)"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M2.002 6a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3H12.28l-4.762 2.858A1 1 0 0 1 6.002 21v-2h-1a3 3 0 0 1-3-3V6Zm3-1a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h2a1 1 0 0 1 1 1v1.234l3.486-2.092a1 1 0 0 1 .514-.142h7a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-14Z"
				></path>
			</svg>
			<span>{ 0 }</span>
		</div>
		<div>
			<svg
				fill="none"
				width="18"
				viewBox="0 0 24 24"
				height="18"
				style={ { color: 'rgb(111, 134, 159)' } }
				aria-hidden="true"
			>
				<path
					fill="hsl(211, 20%, 53%)"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M17.957 2.293a1 1 0 1 0-1.414 1.414L17.836 5H6a3 3 0 0 0-3 3v3a1 1 0 1 0 2 0V8a1 1 0 0 1 1-1h11.836l-1.293 1.293a1 1 0 0 0 1.414 1.414l2.47-2.47a1.75 1.75 0 0 0 0-2.474l-2.47-2.47ZM20 12a1 1 0 0 1 1 1v3a3 3 0 0 1-3 3H6.164l1.293 1.293a1 1 0 1 1-1.414 1.414l-2.47-2.47a1.75 1.75 0 0 1 0-2.474l2.47-2.47a1 1 0 0 1 1.414 1.414L6.164 17H18a1 1 0 0 0 1-1v-3a1 1 0 0 1 1-1Z"
				></path>
			</svg>
			<span>{ 0 }</span>
		</div>
		<div>
			<svg
				fill="none"
				width="18"
				viewBox="0 0 24 24"
				height="18"
				style={ { color: 'rgb(111, 134, 159)' } }
				aria-hidden="true"
			>
				<path
					fill="hsl(211, 20%, 53%)"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M16.734 5.091c-1.238-.276-2.708.047-4.022 1.38a1 1 0 0 1-1.424 0C9.974 5.137 8.504 4.814 7.266 5.09c-1.263.282-2.379 1.206-2.92 2.556C3.33 10.18 4.252 14.84 12 19.348c7.747-4.508 8.67-9.168 7.654-11.7-.541-1.351-1.657-2.275-2.92-2.557Zm4.777 1.812c1.604 4-.494 9.69-9.022 14.47a1 1 0 0 1-.978 0C2.983 16.592.885 10.902 2.49 6.902c.779-1.942 2.414-3.334 4.342-3.764 1.697-.378 3.552.003 5.169 1.286 1.617-1.283 3.472-1.664 5.17-1.286 1.927.43 3.562 1.822 4.34 3.764Z"
				></path>
			</svg>
			<span>{ 0 }</span>
		</div>
		<div>
			<svg fill="none" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
				<path
					fill="hsl(211, 20%, 53%)"
					fillRule="evenodd"
					clipRule="evenodd"
					d="M2 12a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm16 0a2 2 0 1 1 4 0 2 2 0 0 1-4 0Zm-6-2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"
				></path>
			</svg>
		</div>
	</div>
);

export default BlueskyPostActions;

import type { Note } from '../types';
import type { JSX, ReactNode } from 'react';

const badge = ( children: ReactNode, className?: string ): JSX.Element => (
	<svg
		className={ className }
		width="18"
		height="18"
		viewBox="0 0 18 18"
		fill="none"
		xmlns="http://www.w3.org/2000/svg"
		aria-hidden="true"
		focusable="false"
	>
		<circle cx="50%" cy="50%" r="50%" fill="#949494" />
		{ children }
	</svg>
);

const achievement = badge(
	<path
		d="M9.00006 10L12.5001 13.0002C12.5001 13.0002 12.5001 6.00377 12.5001 4.85767H5.50006C5.50006 6.18546 5.50006 13.0002 5.50006 13.0002L9.00006 10Z"
		strokeWidth="1.15"
		strokeLinecap="round"
		strokeLinejoin="round"
		stroke="white"
	/>
);

const add = badge(
	<path d="M9 13.5V9M9 9V4.5M9 9H13.5M9 9H4.5" strokeWidth="1.15" stroke="white" />
);

const info = badge(
	<path
		d="M9 11.5603V8.35991M9 7.39978V6.43966M13.6406 9C13.6406 11.563 11.563 13.6406 9 13.6406C6.43706 13.6406 4.35938 11.563 4.35938 9C4.35938 6.43706 6.43706 4.35938 9 4.35938C11.563 4.35938 13.6406 6.43706 13.6406 9Z"
		strokeWidth="1.15"
		strokeLinejoin="round"
		stroke="white"
	/>
);

const warning = badge(
	<path
		d="M9 6.43965L9 9.64009M9 10.6002L9 11.5603M4.35938 9C4.35938 6.43703 6.43703 4.35937 9 4.35937C11.5629 4.35937 13.6406 6.43703 13.6406 9C13.6406 11.5629 11.5629 13.6406 9 13.6406C6.43703 13.6406 4.35938 11.5629 4.35938 9Z"
		strokeWidth="1.15"
		strokeLinejoin="round"
		stroke="white"
	/>,
	'is-warning'
);

const like = badge(
	<path
		d="M8.99994 4.71875L9.99994 7.25L13.1401 7.72673L10.9999 9.75L11.5587 12.5938L8.99994 11C8.99994 11 7.13836 12.2272 6.4412 12.5938L6.99994 9.75L4.8598 7.72673L7.99994 7.25L8.99994 4.71875Z"
		strokeWidth="1.15"
		stroke="white"
	/>
);

const post = badge(
	<path
		d="M4.75 13.1562L7.5625 10.3437M7.5625 10.3437L9.55122 12.3325C10.2637 11.6201 10.514 10.6205 10.3022 9.70637L12.9062 7.8125L10.0938 5L8.19992 7.60403C7.28572 7.39226 6.28619 7.64258 5.57376 8.35502L7.5625 10.3437Z"
		strokeWidth="1.15"
		stroke="white"
	/>
);

const comment = badge(
	<path
		d="M12.375 5.34375H5.625C5.23667 5.34375 4.92188 5.65855 4.92188 6.04688V11.25V12.6054C4.92188 12.8658 5.24515 12.9864 5.41566 12.7896L6.75 11.25H12.375C12.7634 11.25 13.0781 10.9352 13.0781 10.5469V6.04688C13.0781 5.65855 12.7634 5.34375 12.375 5.34375Z"
		strokeWidth="1.15"
		stroke="white"
	/>
);

// Reply and lock are drawn on a 16px grid, so they're shifted to center in the 18px badge.
const reply = badge(
	<g transform="translate(1 1)">
		<path
			d="M4.13171 6.60933H3.55671V7.75933H4.13171V7.18433V6.60933ZM4.13171 7.18433V7.75933H9.10525V7.18433V6.60933H4.13171V7.18433ZM9.10525 7.18433V7.75933C10.6189 7.75933 11.8459 8.98638 11.8459 10.5H12.4209H12.9959C12.9959 8.35125 11.254 6.60933 9.10525 6.60933V7.18433Z"
			fill="white"
		/>
		<path
			d="M6.10533 9.71042L3.5791 7.18413L6.10533 4.5"
			strokeWidth="1.15"
			strokeLinecap="square"
			stroke="white"
		/>
	</g>
);

const lock = badge(
	<path
		d="M6.16671 7.16675H5.16671C4.98261 7.16675 4.83337 7.31601 4.83337 7.50008V11.5001C4.83337 11.6841 4.98261 11.8334 5.16671 11.8334H10.8334C11.0174 11.8334 11.1667 11.6841 11.1667 11.5001V7.50008C11.1667 7.31601 11.0174 7.16675 10.8334 7.16675H9.83337M6.16671 7.16675V5.00008C6.16671 3.98756 6.98751 3.16675 8.00004 3.16675C9.01257 3.16675 9.83337 3.98756 9.83337 5.00008V7.16675M6.16671 7.16675H9.83337"
		transform="translate(1 1)"
		strokeWidth="1.15"
		stroke="white"
	/>
);

const mention = badge(
	<>
		<path
			d="M8.99993 10.7003C9.93879 10.7003 10.6999 9.93916 10.6999 9.00029C10.6999 8.06141 9.93879 7.30029 8.99993 7.30029C8.06104 7.30029 7.29993 8.06141 7.29993 9.00029C7.29993 9.93916 8.06104 10.7003 8.99993 10.7003Z"
			strokeWidth="1.15"
			strokeLinecap="round"
			strokeLinejoin="round"
			stroke="white"
		/>
		<path
			d="M10.7 9.425C10.7 10.1292 11.2708 10.7 11.975 10.7C12.6792 10.7 13.25 10.1292 13.25 9.425V9C13.25 6.65279 11.3472 4.75 9 4.75C6.65279 4.75 4.75 6.65279 4.75 9C4.75 11.3472 6.65279 13.25 9 13.25C9.47348 13.25 9.92889 13.1726 10.3542 13.0297"
			strokeWidth="1.15"
			strokeLinecap="square"
			strokeLinejoin="round"
			stroke="white"
		/>
	</>
);

const byNoticon: { [ key in string ]: JSX.Element } = {
	'\uf814': mention,
	'\uf300': comment,
	'\uf467': reply,
	'\uf408': like,
	'\uf804': achievement,
	'\uf801': add, // subscribe
	'\uf414': warning,
	'\uf470': lock,
};

// Posts get the pin and new subscribers the plus, whatever icon the server
// sends; anything else unmatched, such as stats and reblogs, gets info.
// Replies arrive with the comment icon, so they're told apart by their parent.
export const getTypeIcon = ( note: Note ): JSX.Element => {
	if ( 'new_post' === note.type ) {
		return post;
	}
	if ( 'follow' === note.type ) {
		return add;
	}
	if ( 'comment' === note.type && note.meta?.ids?.parent_comment ) {
		return reply;
	}
	return byNoticon[ note.noticon ] ?? info;
};

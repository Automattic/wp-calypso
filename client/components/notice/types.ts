/**
 * External dependencies
 */
import type { ReactNode } from 'react';

export type NoticeStatusError = 'is-error';
export type NoticeStatusInfo = 'is-info';
export type NoticeStatusPlain = 'is-plain';
export type NoticeStatusSuccess = 'is-success';
export type NoticeStatusWarning = 'is-warning';
export type NoticeStatus =
	| NoticeStatusError
	| NoticeStatusInfo
	| NoticeStatusPlain
	| NoticeStatusSuccess
	| NoticeStatusWarning;

export type NoticeText = string | ReactNode;

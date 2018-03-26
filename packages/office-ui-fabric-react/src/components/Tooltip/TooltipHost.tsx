/* tslint:disable:no-unused-variable */
import * as React from 'react';
/* tslint:enable:no-unused-variable */
import {
  BaseComponent,
  autobind,
  css,
  divProperties,
  getNativeProps,
  getId,
  assign,
  hasOverflow
} from '../../Utilities';
import { ITooltipHostProps, TooltipOverflowMode } from './TooltipHost.types';
import { Tooltip } from './Tooltip';
import { TooltipDelay } from './Tooltip.types';

import * as stylesImport from './TooltipHost.scss';
const styles: any = stylesImport;

export interface ITooltipHostState {
  isTooltipVisible: boolean;
}

export class TooltipHost extends BaseComponent<ITooltipHostProps, ITooltipHostState> {
  public static defaultProps = {
    delay: TooltipDelay.medium
  };

  // The wrapping div that gets the hover events
  private _tooltipHost: HTMLElement;

  // The ID of the setTimeout that will eventually close the tooltip if the
  // the tooltip isn't hovered over.
  private _closingTimer = -1;

  // Constructor
  constructor(props: ITooltipHostProps) {
    super(props);

    this.state = {
      isTooltipVisible: false
    };
  }

  // Render
  public render() {
    const {
      calloutProps,
      children,
      content,
      delay,
      directionalHint,
      directionalHintForRTL,
      hostClassName,
      id,
      overflowMode,
      setAriaDescribedBy = true,
      tooltipProps
    } = this.props;
    const { isTooltipVisible } = this.state;
    const tooltipId = id || getId('tooltip');

    return (
      <div
        className={ css('ms-TooltipHost',
          styles.host,
          hostClassName,
          overflowMode !== undefined && styles.hostOverflow
        ) }
        ref={ this._resolveRef('_tooltipHost') }
        { ...{ onFocusCapture: this._onTooltipMouseEnter } }
        { ...{ onBlurCapture: this._onTooltipMouseLeave } }
        onMouseEnter={ this._onTooltipMouseEnter }
        onMouseLeave={ this._onTooltipMouseLeave }
        aria-describedby={ setAriaDescribedBy && isTooltipVisible && content ? tooltipId : undefined }
      >
        { children }
        { isTooltipVisible && (
          <Tooltip
            id={ tooltipId }
            delay={ delay }
            content={ content }
            targetElement={ this._getTargetElement() }
            directionalHint={ directionalHint }
            directionalHintForRTL={ directionalHintForRTL }
            calloutProps={ assign(calloutProps, {
              onMouseEnter: this._onTooltipMouseEnter,
              onMouseLeave: this._onTooltipMouseLeave
            }) }
            onMouseEnter={ this._onTooltipMouseEnter }
            onMouseLeave={ this._onTooltipMouseLeave }
            { ...getNativeProps(this.props, divProperties) }
            { ...tooltipProps }
          />
        ) }
      </div>
    );
  }

  private _getTargetElement(): HTMLElement {
    const { overflowMode } = this.props;

    // Select target element based on overflow mode. For parent mode, you want to position the tooltip relative
    // to the parent element, otherwise it might look off.
    if (overflowMode !== undefined) {
      switch (overflowMode) {
        case TooltipOverflowMode.Parent:
          return this._tooltipHost.parentElement!;

        case TooltipOverflowMode.Self:
          return this._tooltipHost;
      }
    }

    return this._tooltipHost;
  }

  // Show Tooltip
  @autobind
  private _onTooltipMouseEnter(ev: any) {
    const { overflowMode } = this.props;

    if (overflowMode !== undefined) {
      const overflowElement = this._getTargetElement();
      if (overflowElement && !hasOverflow(overflowElement)) {
        return;
      }
    }

    this._toggleTooltip(true);
    this._clearDismissTimer();
  }

  // Hide Tooltip
  @autobind
  private _onTooltipMouseLeave(ev: any) {
    if (this.props.closeDelay) {
      this._clearDismissTimer();

      this._closingTimer = window.setTimeout(() => {
        this._toggleTooltip(false);
      }, this.props.closeDelay);
    } else {
      this._toggleTooltip(false);
    }
  }

  @autobind
  private _clearDismissTimer() {
    window.clearTimeout(this._closingTimer);
  }

  // Hide Tooltip
  @autobind
  private _onTooltipCallOutDismiss() {
    this._toggleTooltip(false);
  }

  private _toggleTooltip(isTooltipVisible: boolean) {
    if (this.state.isTooltipVisible !== isTooltipVisible) {
      this.setState(
        { isTooltipVisible },
        () => this.props.onTooltipToggle &&
          this.props.onTooltipToggle(this.state.isTooltipVisible));
    }
  }
}

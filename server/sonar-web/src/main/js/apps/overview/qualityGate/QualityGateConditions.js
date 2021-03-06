/*
 * SonarQube
 * Copyright (C) 2009-2018 SonarSource SA
 * mailto:info AT sonarsource DOT com
 *
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with this program; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 */
import React from 'react';
import { sortBy } from 'lodash';
import PropTypes from 'prop-types';
import QualityGateCondition from './QualityGateCondition';
import { ComponentType, ConditionsListType } from '../propTypes';
import { getMeasuresAndMeta } from '../../../api/measures';
import { enhanceMeasuresWithMetrics } from '../../../helpers/measures';
import { isSameBranchLike, getBranchLikeQuery } from '../../../helpers/branches';

const LEVEL_ORDER = ['ERROR', 'WARN'];

function enhanceConditions(conditions, measures) {
  return conditions.map(c => {
    const measure = measures.find(measure => measure.metric.key === c.metric);
    return { ...c, measure };
  });
}

export default class QualityGateConditions extends React.PureComponent {
  static propTypes = {
    branchLike: PropTypes.object,
    component: ComponentType.isRequired,
    conditions: ConditionsListType.isRequired
  };

  state = {
    loading: true
  };

  componentDidMount() {
    this.mounted = true;
    this.loadFailedMeasures();
  }

  componentDidUpdate(prevProps) {
    if (
      !isSameBranchLike(prevProps.branchLike, this.props.branchLike) ||
      prevProps.conditions !== this.props.conditions ||
      prevProps.component !== this.props.component
    ) {
      this.loadFailedMeasures();
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  loadFailedMeasures() {
    const { branchLike, component, conditions } = this.props;
    const failedConditions = conditions.filter(c => c.level !== 'OK');
    if (failedConditions.length > 0) {
      const metrics = failedConditions.map(condition => condition.metric);
      getMeasuresAndMeta(component.key, metrics, {
        additionalFields: 'metrics',
        ...getBranchLikeQuery(branchLike)
      }).then(r => {
        if (this.mounted) {
          const measures = enhanceMeasuresWithMetrics(r.component.measures, r.metrics);
          this.setState({
            conditions: enhanceConditions(failedConditions, measures),
            loading: false
          });
        }
      });
    } else {
      this.setState({ loading: false });
    }
  }

  render() {
    const { branchLike, component } = this.props;
    const { loading, conditions } = this.state;

    if (loading) {
      return null;
    }

    const sortedConditions = sortBy(
      conditions,
      condition => LEVEL_ORDER.indexOf(condition.level),
      condition => condition.metric.name
    );

    return (
      <div
        className="overview-quality-gate-conditions-list clearfix"
        id="overview-quality-gate-conditions-list">
        {sortedConditions.map(condition => (
          <QualityGateCondition
            branchLike={branchLike}
            component={component}
            condition={condition}
            key={condition.measure.metric.key}
          />
        ))}
      </div>
    );
  }
}

/*
 * Page de détails d'un amendement
 * Le but de cette page est de permettre aux utilisateurs :
 * - d'accéder au détail d'un amendement
 * - TODO : de visualiser le vote de l'amendement
 * - TODO : de participer au vote sur l'amendement
 */

import React from 'react'
import {
  Amend,
  Box,
  Button,
  Buttons,
  Column,
  Columns,
  ErrorPage,
  Icon,
  Notification,
  Page,
  Results,
  UserContext
} from '../../components'
import { socket } from '../../services'
import diff_match_patch from 'diff-match-patch'
import { path } from '../../config'

export class AmendPage extends React.Component {
  constructor(props) {
    super(props)

    this.upVote = () => {
      socket
        .fetch('upVoteAmend', { id: this.props.match.params.id })
        .then(amend => {
          socket.emit('user')
          this.setState({ amend, error: null }, () => {
            this.computeDiff()
          })
        })
    }

    this.downVote = () => {
      socket
        .fetch('downVoteAmend', { id: this.props.match.params.id })
        .then(amend => {
          socket.emit('user')
          this.setState({ amend, error: null }, () => {
            this.computeDiff()
          })
        })
    }

    this.unVote = () => {
      socket
        .fetch('unVoteAmend', { id: this.props.match.params.id })
        .then(amend => {
          socket.emit('user')
          this.setState({ amend, error: null }, () => {
            this.computeDiff()
          })
        })
    }

    this.convertMsToTime = ms => {
      const sec = Math.floor(ms / 1000)
      const hrs = Math.floor(sec / 3600)
      const mins = Math.floor((sec - 3600 * hrs) / 60)

      return hrs + ' heures et ' + mins + ' minutes'
    }

    this.state = {
      index: 0,
      amend: null,
      error: null
    }
  }

  fetchData() {
    socket
      .fetch('amend', { id: this.props.match.params.id })
      .then(amend => {
        this.setState({ amend }, () => {
          this.computeDiff()
          socket.emit('user')
        })
      })
      .catch(error => {
        this.setState({ error })
      })
  }

  componentDidMount() {
    this.fetchData()

    socket.on('amend/' + this.props.match.params.id, ({ error, data }) => {
      if (!error) {
        this.setState({ amend: data }, () => {
          this.computeDiff()
          socket.emit('user')
        })
      }
    })

    this.interval = setInterval(() => {
      this.setState({ index: this.state.index + 1 })
    }, 10 * 1000)
  }

  componentWillUnmount() {
    socket.off('amend')
    socket.off('amend/' + this.props.match.params.id)
    clearInterval(this.interval)
  }

  componentDidUpdate(prevProps) {
    if (prevProps.match.params.id !== this.props.match.params.id) {
      this.fetchData()
    }
  }

  computeDiff() {
    const dmp = new diff_match_patch()
    dmp.Diff_EditCost = 8
    const res = dmp.patch_apply(
      dmp.patch_fromText(this.state.amend.patch),
      this.state.amend.text.actual
    )
    const newText = res[0]
    const diffs = dmp.diff_main(this.state.amend.text.actual, newText)
    dmp.diff_cleanupEfficiency(diffs)
    this.setState({ amend: { diffs, ...this.state.amend } })
  }

  getTitle() {
    return this.state.amend
      ? 'Amendement ' + this.state.amend.name
      : 'Amendement'
  }

  render() {
    if (this.state.error) return <ErrorPage error={this.state.error} />

    return (
      <Page title={this.getTitle()}>
        <UserContext.Consumer>
          {({ user }) => (
            <>
              {this.state.amend && (
                <>
                  <Buttons>
                    <Button to={path.text(this.state.amend.text._id)}>
                      <Icon type="fas fa-chevron-left" />
                      <span>Retour au texte</span>
                    </Button>
                  </Buttons>
                  <Columns>
                    <Column>
                      <Amend data={this.state.amend} />
                    </Column>
                    <Column>
                      <Notification>
                        <p>
                          Le vote est clos à la fin du temps imparti ou dès lors
                          qu'une majorité absolue est atteinte. Le vote est
                          liquide, ce qui veut dire que vous pouvez changer
                          votre vote jusqu'à la fin du scrutin.
                        </p>
                      </Notification>
                      <Box key={this.state.index}>
                        <p className="is-size-5 has-text-centered has-text-weight-semibold">
                          Scrutin en cours sur l'amendement
                        </p>

                        <p className="has-text-centered">
                          Temps restant avant la fin du scrutin :{' '}
                          <span className="has-text-weight-semibold">
                            {this.convertMsToTime(
                              -Math.floor(
                                new Date().getTime() -
                                  (new Date(
                                    this.state.amend.created
                                  ).getTime() +
                                    this.state.amend.delayMax)
                              )
                            )}
                          </span>
                        </p>
                        <br />

                        <Results
                          value={
                            Math.round(
                              (10 * (100 * this.state.amend.upVotesCount)) /
                                (this.state.amend.upVotesCount +
                                  this.state.amend.downVotesCount)
                            ) / 10
                          }
                        />

                        <p className="has-text-centered">
                          {this.state.amend.upVotesCount +
                            this.state.amend.downVotesCount}{' '}
                          vote
                          {this.state.amend.upVotesCount +
                            this.state.amend.downVotesCount >
                          1
                            ? 's'
                            : ''}{' '}
                          exprimé
                          {this.state.amend.upVotesCount +
                            this.state.amend.downVotesCount >
                          1
                            ? 's'
                            : ''}{' '}
                          sur {this.state.amend.text.followersCount} participant
                          {this.state.amend.text.followersCount > 1 ? 's' : ''},
                          soit{' '}
                          {Math.round(
                            (10 *
                              100 *
                              (this.state.amend.upVotesCount +
                                this.state.amend.downVotesCount)) /
                              this.state.amend.text.followersCount
                          ) / 10}
                          % de participation
                        </p>

                        {user &&
                          user.followedTexts.find(
                            followedText =>
                              this.state.amend.text._id === followedText._id
                          ) && (
                            <>
                              <hr />

                              <Buttons className="is-fullwidth">
                                <Button
                                  className={
                                    user.upVotes.find(
                                      id => id === this.state.amend._id
                                    )
                                      ? 'is-success'
                                      : 'is-light'
                                  }
                                  onClick={this.upVote}
                                  style={{ flex: 1 }}
                                >
                                  Voter pour
                                </Button>
                                <Button
                                  className={
                                    !user.upVotes.find(
                                      id => id === this.state.amend._id
                                    ) &&
                                    !user.downVotes.find(
                                      id => id === this.state.amend._id
                                    )
                                      ? 'is-dark'
                                      : 'is-light'
                                  }
                                  onClick={this.unVote}
                                  style={{ flex: 1 }}
                                >
                                  S'abstenir
                                </Button>
                                <Button
                                  className={
                                    user.downVotes.find(
                                      id => id === this.state.amend._id
                                    )
                                      ? 'is-danger'
                                      : 'is-light'
                                  }
                                  onClick={this.downVote}
                                  style={{ flex: 1 }}
                                >
                                  Voter contre
                                </Button>
                              </Buttons>

                              {this.state.error && (
                                <Notification className="is-danger has-text-centered">
                                  {this.state.error}
                                </Notification>
                              )}
                            </>
                          )}
                      </Box>
                    </Column>
                  </Columns>
                </>
              )}
            </>
          )}
        </UserContext.Consumer>
      </Page>
    )
  }
}

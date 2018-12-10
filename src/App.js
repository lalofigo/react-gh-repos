import React, { Component } from 'react';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import $ from '../node_modules/jquery/src/jquery';
import '../node_modules/bootstrap/dist/js/bootstrap.min.js';
import Modal from 'react-bootstrap/lib/Modal';

const API = "https://api.github.com/search/repositories?sort=updated&order=desc&q=";
const API_COMMITS = "https://api.github.com/search/commits?sort=committer-date&order=desc&q=repo:";

class CommitsList extends React.Component{
  render(){  
    /*console.log(this.props.list)*/
    return (
       <div>
         { this.props.list.map(commits => <p>{commits.author} : {commits.message}</p>)}
       </div> 
      )}    
}

class RepoList extends React.Component{
  constructor(props, context) {
    super(props, context);

    this.handleShow = this.handleShow.bind(this)
    this.handleClose = this.handleClose.bind(this)

    this.state = {
      show: false,
      modalTitle: "",
      repoName: "",
      commits:[ ]
    }
  }

  handleClose() {
    this.setState({ show: false })
  }

  handleShow({ target }) {
    this.setState({ show: true })
    this.setState({ modalTitle: target.title })
    this.setState({ repoName: target.title })
    
    /*let queryString = `${API_COMMITS}${target.title}`*/
    let queryString = target.getAttribute('data-url')
    queryString = queryString.slice(0, -6);
    /*console.log(queryString)*/
    this.setState({commits:[ ]})
    fetch(queryString,
         {headers: {
              'Accept': 'application/vnd.github.cloak-preview'
                    }
         })
			.then(response => response.json() )
			.then(commits => {
       console.log(commits)
				commits.forEach( commit => {
         
          let data ={
            author : commit.commit.author.name,
            message : commit.commit.message
          }
          
          this.setState({commits : this.state.commits.concat([data]) })
          
        })
		})
		.catch((err) => {
			throw new Error('Error: Not possible to fetch data');
		})
  }
    
  render(){  
    /*console.log(this.props.list)*/
    return (
       <div className="container-results">
         { this.props.list.map( (repository) => 
                               (<div className="results"> <h3 title={repository.name} 
                                   data-url={repository.commits_url}                                                                onClick={this.handleShow}> {repository.name} </h3></div>)
                              )
         }
        
        <Modal show={this.state.show} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>{this.state.modalTitle}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <div> <CommitsList repo ={this.state.modalTitle} list={this.state.commits}/> </div>
          </Modal.Body>
        </Modal>
        </div>
       
    )  
  }
}
class SearchForm extends React.Component{
  constructor(){
    super()
    this.state = {
      query: '',
      repos:[ ]
    }
    this.doSearch = this.doSearch.bind(this)
    this.handleChange = this.handleChange.bind(this)
  }
  
  handleChange({ target }) {
    this.setState({
      query : target.value
    });
  }
  
  doSearch(){
    let queryString = `${API}${this.state.query}`
    /*console.log(queryString)*/
    this.setState({repos:[ ]})
    fetch(queryString)
			.then(response => response.json() )
			.then(repos => {
				repos.items.forEach( repo => {
          let data ={
            name : repo.name,
            commits_url: repo.commits_url
          }
          this.setState({repos : this.state.repos.concat([data]) })
        })
		})
		.catch((err) => {
			throw new Error('Error: Not possible to fetch data');
		})
  }
  
  render(){
    return <div className="search">
            <input type="text" value={this.state.query} onChange={this.handleChange} placeholder="Type here"></input>
            <button onClick={this.doSearch}>{this.props.buttonText}</button>
            <RepoList list={this.state.repos}/>
           </div> 
  }
}

class Title extends React.Component{
  render(){
    return <h2>{this.props.text}</h2>
  }
}

class App extends React.Component{
  render(){
    return <div>
            <Title />
            <SearchForm />
           </div>
  }
}

Title.defaultProps = {
  text: "Search Repos in Github"
}

SearchForm.defaultProps = {
  buttonText: "Search"
}

export default App;

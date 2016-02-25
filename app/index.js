/**
 * Created by xiaoxiaosu on 2016/2/24.
 */

require('./index.css');
var _ = require("underscore"),
    $ = require("jquery"),
    Backbone = require("backbone"),
    React = require("react"),
    ReactDOM = require("react-dom");
	
window.root = $.extend({
	commentList : new Backbone.Collection(),
	commentUpdate: null
}, Backbone.Events);

root.commentList.reset([
    {id:1,name:"surui",age:"25",sex:"man"},
    {id:2,name:"fengche",age:"25",sex:"man"}
])

var CommentItem = React.createClass({
	handleDel: function(){//删除comment
		var commentList = root.commentList;
		commentList.remove(commentList.findWhere(this.props));
		root.trigger('delete');
		console.info("您当前删除的comment:", this.props);
		console.log("-----------------------(^n^)删除成功！-----------------------");
	},
	handleEdit: function(){//编辑comment
		root.trigger('update',this.props);
		root.commentUpdate = _.clone(this.props);
		console.info("您当前编辑的comment:", root.commentUpdate);
	},
    render:function(){
        return (
            <li>
				<span>{this.props.id}</span>--
                <span>{this.props.name}</span>--
                <span>{this.props.age}</span>--
                <span>{this.props.sex}</span>--
				<span onClick={this.handleDel}>[删除]</span>--
				<span onClick={this.handleEdit}>[编辑]</span>
            </li>
        )
    }
})

var CommentList= React.createClass({
    render:function(){
        var nodes = this.props.items.map(function(item,i){
            return <CommentItem key={"item-"+i} id={item.id} name={item.name} age={item.age} sex={item.sex}/>
        })
        return (
            <ul className="nav nav-list">
                {nodes}
            </ul>
        )
    }
})

var CommentForm = React.createClass({
    getInitialState:function(){
        return {
			id:"",
            name:"",
            age:"",
            sex:""
        }
    },
	componentDidMount:function(){
        _.extend(this,Backbone.Events)
        var that = this
		this.listenTo(root, 'update', function(comment){
            that.setState(comment);
        });
		this.listenTo(root, 'delete', function(){
            that.clear();
        })
    },
    render:function(){
        return (
            <div className="comment-form">
                <p>
                    <label>name:</label>
                    <input value={this.state.name} onChange={this.change.bind(this,'name')} className="form-control"/>
                </p>
                <p>
                    <label>age:</label><input value={this.state.age}  onChange={this.change.bind(this,'age')} className="form-control"/>
                </p>
                <p>
                    <label>sex:</label><input value={this.state.sex}  onChange={this.change.bind(this,'sex')} className="form-control"/>
                </p>
                <button onClick={this.submit} className="btn btn-primary btn-sm">保存</button>
            </div>
        )
    },
    change:function(state,e){
        var s= {}
        s[state] = e.target.value
        this.setState(s)
    },
    submit:function(){
		var commentUpdate = root.commentUpdate;//当前要编辑的comment
		var commentId = commentUpdate && commentUpdate.id;
		var _commentUpdate;

		var lastComment, newCommentId, newComment = _.clone(this.state);//新增的comment
		
		if(root.commentList.length){
			lastComment = root.commentList.last().toJSON();
			newCommentId = lastComment.id + 1;
		}else{//commentList为空时
			lastComment = {};
			newCommentId = 1;
		}

		if(commentId){//修改comment
			if(!this.pass(newComment)) return false;
			_commentUpdate = root.commentList.get(commentId);
			_commentUpdate.set(this.state);//保存修改
			console.log("-----------------------(^_^)编辑成功！-----------------------");
		}else{//新增comment
			if(!this.pass(newComment)) return false;
			newComment.id = newCommentId;
			console.info("您当前新增的comment:", newComment);
			root.commentList.add(newComment);//新增
			console.log("-----------------------(^_^)新增成功！-----------------------");
		}
		this.clear();
    },
	clear: function(){
		root.commentUpdate = null;
		this.setState({//清空表单
			id:	"",
			name:"",
			age:"",
			sex:""
		});
	},
	pass: function(comment){
		if(comment.name == "" || comment.age == "" || comment.sex == ""){
			console.log("不能留空哦！");
			alert("不能留空哦！");
			return false;
		}
		return true;
	}
})

var CommentBox = React.createClass({
    getInitialState:function(){
        return {
            items:root.commentList.toJSON()
        }
    },
    render:function(){
        var that = this
        return(
            <div className="comment-box">
                <CommentList items={that.state.items}/>
                <CommentForm/>
            </div>
        )
    },
    componentDidMount:function(){
        _.extend(this,Backbone.Events)

        var that = this
        this.listenTo(root.commentList,'change add remove reset',function(){
            that.setState({
                items:root.commentList.toJSON()
            })
        })
    }
})
ReactDOM.render(<CommentBox/>,document.getElementById('root'))